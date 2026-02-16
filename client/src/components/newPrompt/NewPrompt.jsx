import { useEffect, useRef, useState, useMemo } from "react"; // ✅ Add useMemo
import "./newPrompt.css";
import Upload from "../upload/Upload";
import { IKImage } from "imagekitio-react";
import model from "../../lib/gemini";
import Markdown from "react-markdown";
import { useAuth } from "@clerk/clerk-react";

const NewPrompt = ({ data, id }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {}, // { mimeType, data(base64) }
  });

  const { getToken } = useAuth();

  // ✅ Memoize chat session to prevent recreation on every render
  const chat = useMemo(() => {
    return model.startChat({
      history:
        data?.history?.map((m) => ({
          role: m.role,
          parts: [{ text: m.parts[0].text }],
        })) || [],
    });
  }, [id, data]); // Restart session only if chat ID or data changes

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [question, answer, img.dbData]);

  const add = async (promptText) => {
    try {
      setQuestion(promptText);

      let result;

      if (Object.entries(img.aiData).length) {
        result = await chat.sendMessageStream([
          promptText,
          {
            inlineData: {
              data: img.aiData.data,
              mimeType: img.aiData.mimeType,
            },
          },
        ]);
      } else {
        result = await chat.sendMessageStream(promptText);
      }

      let accumulatedText = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        accumulatedText += chunkText;
        setAnswer(accumulatedText);
      }

      // ✅ PERSIST TO BACKEND
      try {
        const token = await getToken();
        await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            question: promptText,
            answer: accumulatedText,
            img: img.dbData?.filePath || null,
          }),
        });
        console.log("✅ History persisted to DB");
      } catch (dbErr) {
        console.error("❌ DB Persist Error:", dbErr);
      }

      setImg({
        isLoading: false,
        error: "",
        dbData: {},
        aiData: {},
      });
    } catch (error) {
      console.error("Gemini API Error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const input = e.target.text.value.trim();
    if (!input) return;
    await add(input);
    e.target.reset();
  };

  return (
    <>
      {img.isLoading && <div className="loading">Uploading image...</div>}

      {img.dbData?.filePath && (
        <IKImage
          urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
          path={img.dbData.filePath}
          width={380}
          transformation={[{ width: 380 }]}
          className="uploadPreview"
        />
      )}

      {question && <div className="message user">{question}</div>}
      {answer && (
        <div className="message">
          <Markdown>{answer}</Markdown>
        </div>
      )}
      <div className="endChat" ref={endRef} />

      <form className="newForm" onSubmit={handleSubmit}>
        <Upload setImg={setImg} />
        <input id="file" type="file" hidden />
        <input type="text" name="text" placeholder="Ask anything..." />
        <button type="submit">
          <img src="/arrow.png" alt="send" />
        </button>
      </form>
    </>
  );
};

export default NewPrompt;
