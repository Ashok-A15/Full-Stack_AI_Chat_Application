import React, { useRef } from "react";
import { IKContext, IKUpload } from "imagekitio-react";

const urlEndpoint = import.meta.env.VITE_IMAGE_KIT_ENDPOINT;
const publicKey = import.meta.env.VITE_IMAGE_KIT_PUBLIC_KEY;

// Authenticator talks to backend
const authenticator = async () => {
  try {
    const response = await fetch("http://localhost:3001/api/upload");
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed with status ${response.status}: ${errorText}`);
    }
    const data = await response.json();
    const { signature, expire, token } = data;
    return { signature, expire, token };
  } catch (error) {
    console.error("Authentication request failed:", error);
    throw error;
  }
};

const Upload = ({ setImg }) => {
  const ikUploadRef = useRef(null);

  const onError = (err) => {
    console.log("Error", err);
  };

  const onSuccess = (res) => {
    console.log("Success", res);
    setImg((prev) => ({ ...prev, isLoading: false, dbData: res }));
  };

  const onUploadProgress = (progress) => {
    console.log("Progress", progress);
  };

  const onUploadStart = (evt) => {
    const file = evt.target.files[0];

    const reader = new FileReader();
    reader.onloadend = () => {
      setImg((prev) => ({
        ...prev,
        isLoading: true,
        aiData: {
          mimeType: file.type, // ✅ direct structure
          data: reader.result.split(",")[1], // ✅ base64 string
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <IKContext
      urlEndpoint={urlEndpoint}
      publicKey={publicKey}
      authenticator={authenticator}
    >
      <IKUpload
        fileName="test-upload.png"
        useUniqueFileName={true}
        onUploadStart={onUploadStart}
        onUploadProgress={onUploadProgress}
        onError={onError}
        onSuccess={onSuccess}
        style={{ display: "none" }}
        ref={ikUploadRef}
      />
      <label onClick={() => ikUploadRef.current.click()}>
        <img src="/attachment.png" alt="upload" />
      </label>
    </IKContext>
  );
};

export default Upload;
