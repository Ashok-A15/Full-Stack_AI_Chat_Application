import { useEffect, useRef, useState } from "react";
import "./newPrompt.css";
import Upload from "../upload/Upload";
import { IKImage } from "imagekitio-react";
import model from "../../lib/gemini"; // ✅ ensure correct export from gemini.js
import Markdown from "react-markdown";
import { text } from "framer-motion/client";

const NewPrompt = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {}, // { mimeType, data(base64) }
  });

  // ✅ Start a chat session once
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hello, I have 2 dogs in my house" }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you, What would you like to know?" }],
      },
    ],
    generationConfig: {
      // maxOutputTokens: 200,
    },
  });

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [question, answer, img.dbData]);

  const add = async (promptText) => {
    try {
      setQuestion(promptText);

      let result;

      if (Object.entries(img.aiData).length) {
        // ✅ Text + Image multimodal request
        result = await chat.sendMessageStream({
          contents: [
            {
              role: "user",
              parts: [
                { text: promptText },
                {
                  inlineData: {
                    mimeType: img.aiData.mimeType,
                    data: img.aiData.data,
                  },
                },
              ],
            },
          ],
        });
      } else {
        // ✅ Text-only request
        result = await chat.sendMessageStream(promptText);
      }

      // ✅ Collect streaming text
      let accumulatedText = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        console.log(chunkText);
        accumulatedText += chunkText;
      }

      // reset image after request
      setImg({
        isLoading: false,
        error: "",
        dbData: {},
        aiData: {},
      });

      setAnswer(accumulatedText);
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
      {img.isLoading && <div>Loading...</div>}

      {img.dbData?.filePath && (
        <IKImage
          urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
          path={img.dbData.filePath}
          width={380}
          transformation={[{ width: 380 }]}
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
