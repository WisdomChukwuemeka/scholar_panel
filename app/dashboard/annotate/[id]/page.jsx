// app/dashboard/annotate/[id]/page.jsx (or wherever this file is)
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { PublicationAPI } from "@/app/services/api";
import {
  PdfLoader,
  PdfHighlighter,
  Highlight,
  Popup,
  AreaHighlight,
} from "react-pdf-highlighter";
import "react-pdf-highlighter/dist/style.css";

// Custom Tip component for better comment input
const CustomTip = ({ onConfirm, onCancel }) => {
  const [text, setText] = useState("");

  return (
    <div className="bg-white border border-gray-300 rounded p-2 shadow-md">
      <textarea
        className="w-full border border-gray-200 rounded p-1 mb-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a note..."
        rows={2}
      />
      <div className="flex justify-end space-x-2">
        <button
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => {
            if (text.trim()) onConfirm({ text: text.trim() });
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default function AnnotatePDFPage() {
  const { id } = useParams();
  const [pub, setPub] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const highlighterRef = useRef(null);

  // Fetch publication details and PDF as blob
  useEffect(() => {
    const fetchPublication = async () => {
      try {
        const res = await PublicationAPI.detail(id);
        setPub(res.data);
        console.log("Publication details:", res.data);

        // Load existing annotations if any
        if (res.data.editor_comments) {
          try {
            const parsed = JSON.parse(res.data.editor_comments);
            setHighlights(Array.isArray(parsed) ? parsed : []);
          } catch (e) {
            console.warn("Could not parse existing annotations:", e);
          }
        }

        // Fetch PDF as blob to bypass potential CORS and add error handling
        if (res.data.file) {
          const fileResponse = await fetch(res.data.file);
          if (!fileResponse.ok) {
            throw new Error(`Failed to fetch PDF: ${fileResponse.status} ${fileResponse.statusText}`);
          }
          const blob = await fileResponse.blob();
          if (blob.type !== "application/pdf") {
            throw new Error("Fetched file is not a valid PDF");
          }
          setPdfUrl(URL.createObjectURL(blob));
        } else {
          throw new Error("No PDF file URL found in publication data");
        }
      } catch (error) {
        console.error("Failed to fetch publication or PDF:", error);
        setLoadError(error.message || "Unknown error loading PDF");
      }
    };
    fetchPublication();
  }, [id]);

  // Add a highlight with comment object
  const handleAddHighlight = ({ content, position, comment }) => {
    if (!comment?.text?.trim()) return;
    const newHighlight = {
      id: String(Math.random()).slice(2),
      content,
      position,
      comment, // { text: string }
    };
    setHighlights((prev) => [...prev, newHighlight]);
    handleSaveAnnotations(); // Auto-save
  };

  // Update a highlight's comment
  const handleEditHighlight = (highlightId, newText) => {
    if (!newText?.trim()) return;
    setHighlights((prev) =>
      prev.map((h) =>
        h.id === highlightId ? { ...h, comment: { text: newText } } : h
      )
    );
    handleSaveAnnotations(); // Auto-save
  };

  // Delete a highlight
  const handleDeleteHighlight = (highlightId) => {
    setHighlights((prev) => prev.filter((h) => h.id !== highlightId));
    handleSaveAnnotations(); // Auto-save
  };

  // Save highlights to backend
  const handleSaveAnnotations = async () => {
    const formData = new FormData();
    formData.append("editor_comments", JSON.stringify(highlights));

    try {
      await PublicationAPI.annotate(id, formData);
      console.log("Annotations saved successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save annotations");
    }
  };

  if (loadError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 text-lg">
        Error loading PDF: {loadError}
      </div>
    );
  }

  if (!pub || !pdfUrl) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        Loading publication details and PDF...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Annotate — {pub.title}
      </h1>

      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <div
          style={{
            height: "80vh",
            width: "100%",
            position: "relative",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <PdfLoader url={pdfUrl} beforeLoad={<div>Loading PDF...</div>}>
            {(pdfDocument) => (
              <PdfHighlighter
                ref={highlighterRef}
                pdfDocument={pdfDocument}
                enableAreaSelection={(event) => event.altKey}
                onScrollChange={() => {}}
                onSelectionFinished={(
                  position,
                  content,
                  hideTipAndSelection,
                  transformSelection
                ) => (
                  <CustomTip
                    onCancel={() => {
                      transformSelection(); // Reset selection
                      hideTipAndSelection();
                    }}
                    onConfirm={(comment) => {
                      handleAddHighlight({ content, position, comment });
                      hideTipAndSelection();
                    }}
                  />
                )}
                highlightTransform={(
                  highlight,
                  index,
                  setTip,
                  hideTip,
                  viewportToScaled,
                  screenshot,
                  isScrolledTo
                ) => {
                  const isTextHighlight = !Boolean(
                    highlight.content && highlight.content.image
                  );

                  const component = isTextHighlight ? (
                    <Highlight
                      isScrolledTo={isScrolledTo}
                      position={highlight.position}
                      comment={highlight.comment}
                      onClick={() => {
                        const newText = window.prompt(
                          "Edit note:",
                          highlight.comment?.text || ""
                        );
                        if (newText !== null) handleEditHighlight(highlight.id, newText);
                      }}
                    />
                  ) : (
                    <AreaHighlight
                      isScrolledTo={isScrolledTo}
                      highlight={highlight}
                      onChange={(boundingRect) => {
                        // Update area if resized (optional)
                      }}
                      onClick={() => {
                        const newText = window.prompt(
                          "Edit note:",
                          highlight.comment?.text || ""
                        );
                        if (newText !== null) handleEditHighlight(highlight.id, newText);
                      }}
                    />
                  );

                  return (
                    <Popup
                      popupContent={<div>{highlight.comment?.text || "No note"}</div>}
                      onMouseOver={(popupContent) => setTip(highlight, popupContent)}
                      onMouseOut={hideTip}
                      key={index}
                    >
                      {component}
                    </Popup>
                  );
                }}
                highlights={highlights}
              />
            )}
          </PdfLoader>
        </div>

        <div className="p-4 flex justify-between items-center bg-gray-100">
          <p className="text-gray-600 text-sm">
            <strong>{highlights.length}</strong> highlight
            {highlights.length !== 1 && "s"} added.
          </p>
          <button
            onClick={handleSaveAnnotations}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            💾 Save Annotations
          </button>
        </div>
      </div>
    </div>
  );
}