import { useState } from 'react';
import './chatPage.css';
import NewPrompt from '../../components/newPrompt/NewPrompt';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import Markdown from 'react-markdown';
import { IKImage } from 'imagekitio-react';

const ChatPage = () => {
  const { id } = useParams();
  const { getToken } = useAuth();
  const [copiedIdx, setCopiedIdx] = useState(null);

  const { isLoading, error, data } = useQuery({
    queryKey: ['chat', id],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chats/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch chat history');
      return res.json();
    },
  });

  const handleCopyText = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(index);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="chatPage">
      <div className="wrapper">
        <div className="chat">
          {isLoading ? (
            <div className="loadingState">Loading messages...</div>
          ) : error ? (
            <div className="errorState">Unable to load chat history.</div>
          ) : (
            data?.history?.map((message, i) => (
              <div key={i} className="messageWrapper">
                {message.img && (
                  <div className={`message ${message.role === 'user' ? 'user' : ''}`}>
                    <IKImage
                      urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                      path={message.img}
                      width={300}
                      transformation={[{ width: 300 }]}
                    />
                  </div>
                )}
                <div className={`message ${message.role === 'user' ? 'user' : ''}`}>
                  <Markdown>{message.parts[0].text}</Markdown>
                  <button
                    className="copyBtn"
                    onClick={() => handleCopyText(message.parts[0].text, i)}
                    title="Copy to clipboard"
                  >
                    {copiedIdx === i ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
              </div>
            ))
          )}
          <NewPrompt data={data} id={id} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;