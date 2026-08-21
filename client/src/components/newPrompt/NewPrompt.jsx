import { useEffect, useRef, useState, useMemo } from "react";
import "./newPrompt.css";
import Upload from "../upload/Upload";
import { IKImage } from "imagekitio-react";
import model from "../../lib/gemini";
import Markdown from "react-markdown";
import { useAuth } from "@clerk/clerk-react";
import { useQueryClient } from "@tanstack/react-query";

const NewPrompt = ({ data, id }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {},
  });

  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const hasInitialRun = useRef(false);

  // Format history as paired user-model messages for startChat
  const chatHistory = useMemo(() => {
    if (!data?.history || data.history.length === 0) return [];
    const historyPairs = [];
    const len = data.history.length;
    for (let i = 0; i < len; i += 2) {
      if (data.history[i]?.role === "user" && data.history[i + 1]?.role === "model") {
        historyPairs.push({
          role: "user",
          parts: [{ text: data.history[i].parts[0].text }],
        });
        historyPairs.push({
          role: "model",
          parts: [{ text: data.history[i + 1].parts[0].text }],
        });
      }
    }
    return historyPairs;
  }, [data]);

  const chat = useMemo(() => {
    return model.startChat({
      history: chatHistory,
    });
  }, [id, chatHistory]);

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [question, answer, img.dbData]);

  const add = async (promptText, isInitial = false) => {
    try {
      if (!isInitial) {
        setQuestion(promptText);
      }

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

      // PERSIST TO BACKEND
      try {
        const token = await getToken();
        const API_URL = import.meta.env.VITE_API_URL || "https://full-stack-ai-chat-application.onrender.com";
        await fetch(`${API_URL}/api/chats/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            question: isInitial ? null : promptText,
            answer: accumulatedText,
            img: img.dbData?.filePath || null,
          }),
        });
        console.log("✅ History persisted to DB");
        queryClient.invalidateQueries({ queryKey: ["userChats"] });
        queryClient.invalidateQueries({ queryKey: ["chat", id] });
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
      setAnswer("⚠️ Unable to process prompt: " + (error.message || "Gemini API error. Please try again."));
    }
  };

  // Auto-respond to the initial question if chat was just created
  useEffect(() => {
    if (data?.history && data.history.length === 1 && data.history[0].role === "user" && !hasInitialRun.current) {
      hasInitialRun.current = true;
      const initialText = data.history[0].parts[0].text;
      add(initialText, true);
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const input = e.target.text.value.trim();
    if (!input) return;
    await add(input);
    e.target.reset();
  };

  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef(null);

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (inputRef.current) {
        inputRef.current.value = (inputRef.current.value ? inputRef.current.value + " " : "") + transcript;
      }
    };

    recognition.onerror = (err) => {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
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

      <form className="newForm" onSubmit={handleSubmit} autoComplete="off">
        <Upload setImg={setImg} />
        <input id="file" type="file" hidden />
        <input ref={inputRef} type="text" name="text" placeholder="Ask anything..." autoComplete="off" />
        <button
          type="button"
          className={`voiceBtn ${isListening ? 'listening' : ''}`}
          onClick={handleVoiceInput}
          title={isListening ? 'Listening...' : 'Voice Input'}
        >
          🎙️
        </button>
        <button type="submit">
          <img src="/arrow.png" alt="send" />
        </button>
      </form>
    </>
  );
};

export default NewPrompt;
