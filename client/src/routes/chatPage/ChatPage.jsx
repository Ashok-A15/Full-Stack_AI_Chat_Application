import './chatPage.css'
import NewPrompt from '../../components/newPrompt/NewPrompt';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import Markdown from 'react-markdown';
import { IKImage } from 'imagekitio-react';

const ChatPage = () => {
    const { id } = useParams();
    const { getToken } = useAuth();

    const { isLoading, error, data } = useQuery({
        queryKey: ["chat", id],
        queryFn: async () => {
            const token = await getToken();
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error("Failed to fetch chat history");
            return res.json();
        },
    });

    return (
        <div className='chatPage'>
            <div className='wrapper'>
                <div className='chat'>
                    {isLoading ? (
                        "Loading..."
                    ) : error ? (
                        "Something went wrong!"
                    ) : (
                        data?.history?.map((message, i) => (
                            <div key={i}>
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