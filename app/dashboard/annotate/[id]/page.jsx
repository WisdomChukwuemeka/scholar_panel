"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PublicationAPI } from "@/app/services/api";
import {
  PdfLoader,
  PdfHighlighter,
  Tip,
  Highlight,
  Popup,
} from "react-pdf-highlighter";
import { PDFDocument, rgb } from "pdf-lib";
import { toast } from "react-toastify";

const COLORS = {
  yellow: { r: 1, g: 1, b: 0, opacity: 0.4 },
  red: { r: 1, g: 0, b: 0, opacity: 0.4 },
  blue: { r: 0, g: 0, b: 1, opacity: 0.4 },
  green: { r: 0, g: 1, b: 0, opacity: 0.4 },
};

export default function AnnotatePDFPage() {
  const { id } = useParams();
  const [pub, setPub] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [color, setColor] = useState("yellow");
  const [isGenerating, setIsGenerating] = useState(false);

  /** LOAD PUBLICATION */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await PublicationAPI.detail(id);
        setPub(res.data);

        console.log("Publication Loaded:", res.data);

        /** Load saved editor highlights */
        if (res.data.editor_comments) {
          try {
            const parsed = JSON.parse(res.data.editor_comments);
            setHighlights(Array.isArray(parsed) ? parsed : []);
          } catch (e) {}
        }

        /** Fix Cloudinary PDF CORS issue */
        if (res.data.file) {
          const cloudinaryUrl = res.data.file + "?fl_attachment=false&force=true";

          console.log("FINAL PDF URL:", cloudinaryUrl);

          const response = await fetch(cloudinaryUrl, { mode: "cors" });

          console.log("FETCH STATUS:", response.status);
          console.log("FETCH TYPE:", response.type);

          if (!response.ok) throw new Error("Failed to fetch PDF");

          const blob = await response.blob();
          const localUrl = URL.createObjectURL(blob);

          console.log("PDF Blob Loaded:", blob);
          setPdfUrl(localUrl);
        }
      } catch (e) {
        console.log(e);
        toast.error("Failed to load PDF");
      }
    };
    load();
  }, [id]);

  /** ADD HIGHLIGHT */
  const addHighlight = (highlight) => {
    setHighlights((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        color,
        ...highlight,
      },
    ]);
  };

  /** UPDATE / DELETE HIGHLIGHT */
  const updateHighlight = (id, data) => {
    setHighlights((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...data } : h))
    );
  };

  const deleteHighlight = (id) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  };

  /** SAVE HIGHLIGHTS WITHOUT PDF GENERATION */
  const saveHighlights = async () => {
    const fd = new FormData();
    fd.append("editor_comments", JSON.stringify(highlights));

    try {
      await PublicationAPI.annotate(id, fd);
      toast.success("Annotations saved!");
    } catch {
      toast.error("Failed to save");
    }
  };

  /** GENERATE ANNOTATED PDF */
  const generateAnnotatedPDF = async () => {
    if (!pub?.file) return;
    if (!highlights.length) return toast.warning("No highlights found");

    setIsGenerating(true);

    try {
      const originalUrl = pub.file + "?fl_attachment=false&force=true";
      const bytes = await fetch(originalUrl).then((r) => r.arrayBuffer());
      const pdfDoc = await PDFDocument.load(bytes);
      const pages = pdfDoc.getPages();

      for (const h of highlights) {
        const rect = h.position?.boundingRect;
        const viewport = h.position?.viewport;

        if (!rect || !viewport) continue;

        const page = pages[h.position.pageNumber - 1];
        const col = COLORS[h.color] ?? COLORS.yellow;

        const scale = page.getWidth() / viewport.width;

        const x = rect.x1 * scale;
        const y = page.getHeight() - rect.y2 * scale;
        const width = rect.width * scale;
        const height = rect.height * scale;

        page.drawRectangle({
          x,
          y,
          width,
          height,
          color: rgb(col.r, col.g, col.b),
          opacity: col.opacity,
          borderWidth: 0,
        });
      }

      /** SAVE NEW PDF */
      const newBytes = await pdfDoc.save();
      const file = new File([newBytes], `annotated_${pub.id}.pdf`, {
        type: "application/pdf",
      });

      /** UPLOAD FILE */
      const fd = new FormData();
      fd.append("annotated_file", file);
      fd.append("editor_comments", JSON.stringify(highlights));

      await PublicationAPI.annotate(id, fd);

      toast.success("PDF Generated!");

      /** Reload publication */
      const refreshed = await PublicationAPI.detail(id);
      setPub(refreshed.data);
    } catch (e) {
      console.error("PDF generation error:", e);
      toast.error("PDF generation failed");
    }

    setIsGenerating(false);
  };

  if (!pub || !pdfUrl)
    return <div className="p-8 text-center">Loading…</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* HEADER */}
      <div className="bg-white p-4 shadow flex justify-between">
        <h1 className="text-lg font-bold">Annotate: {pub.title}</h1>

        <div className="flex gap-3">
          <select
            className="px-3 py-2 border rounded"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          >
            {Object.keys(COLORS).map((c) => (
              <option key={c} value={c}>
                {c.toUpperCase()}
              </option>
            ))}
          </select>

          <button
            onClick={saveHighlights}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save
          </button>

          <button
            onClick={generateAnnotatedPDF}
            disabled={isGenerating}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-40"
          >
            {isGenerating ? "Processing…" : "Generate PDF"}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex h-[calc(100vh-70px)]">
        
        {/* PDF VIEWER */}
        <div className="w-3/4 relative">
          <PdfLoader url={pdfUrl}>
            {(doc) => (
              <PdfHighlighter
                pdfDocument={doc}
                style={{ height: "100%" }}
                enableAreaSelection={(e) => e.altKey}
                onSelectionFinished={(position, content, hide) => (
                  <Tip
                    onConfirm={(text) => {
                      addHighlight({
                        position,
                        content,
                        comment: { text },
                      });
                      hide();
                    }}
                  />
                )}
                highlightTransform={(h, i, setTip, hideTip) => {
                  const col = COLORS[h.color];
                  return (
                    <Popup
                      key={i}
                      popupContent={
                        <div className="bg-white p-2 border rounded shadow text-sm">
                          <button
                            onClick={() => {
                              const action = prompt(
                                `Edit note or type "delete":\n\n${h.comment?.text || ""}`
                              );
                              if (action === "delete") deleteHighlight(h.id);
                              else if (action !== null)
                                updateHighlight(h.id, {
                                  comment: { text: action },
                                });
                              hideTip();
                            }}
                            className="text-blue-600 underline"
                          >
                            Edit
                          </button>
                        </div>
                      }
                      onMouseOver={() => setTip(i)}
                      onMouseOut={hideTip}
                    >
                      <Highlight
                        isScrolledTo={false}
                        position={h.position}
                        comment={h.comment}
                        color={`rgba(${col.r * 255}, ${col.g * 255}, ${
                          col.b * 255
                        }, ${col.opacity})`}
                      />
                    </Popup>
                  );
                }}
                highlights={highlights}
              />
            )}
          </PdfLoader>
        </div>

        {/* SIDEBAR */}
        <div className="w-1/4 p-4 overflow-y-auto bg-gray-50">
          <h3 className="font-bold mb-3">
            Highlights ({highlights.length})
          </h3>

          {highlights.map((h) => (
            <div
              key={h.id}
              className="bg-white p-3 mb-3 rounded shadow text-sm"
            >
              <strong>Page {h.position.pageNumber}</strong>
              <p className="mt-1 text-gray-600">
                {h.content.text?.slice(0, 80)}…
              </p>
              {h.comment?.text && (
                <p className="mt-2 italic text-blue-600">
                  "{h.comment.text}"
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* DOWNLOAD BUTTON */}
      {pub.annotated_file && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded shadow">
          <a href={pub.annotated_file} target="_blank">
            Download Annotated PDF
          </a>
        </div>
      )}
    </div>
  );
}
