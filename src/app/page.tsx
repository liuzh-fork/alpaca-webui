'use client';

import { useState, useRef, useEffect } from 'react';
import { TChatMessage, ChatRole } from '@/lib/types';
import { AlertBox } from '@/components/alert-box';
import { delayHighlighter } from '@/lib/utils';
import { ChatInput } from '@/components/chat-input';
import { Chat } from '@/components/chat';
import { useChatStream } from '@/hooks/use-chat-stream';
import { useModelList } from '@/hooks/use-model-list';
import { useSettingsStore } from '@/lib/settings-store';
import { useModelStore } from '@/lib/model-store';
import ModelAlts from '@/components/model-alts';
import { api } from '@/lib/api';

export default function Home() {
  const { selectedModel, setModel, selectedService, setService } = useModelStore();
  const { systemPrompt, hasHydrated } = useSettingsStore();
  const [isFetchLoading, setIsFetchLoading] = useState<boolean>(false);
  const mainDiv = useRef<HTMLDivElement>(null);
  const [textareaPlaceholder, setTextareaPlaceholder] = useState<string>('Choose model...');
  const { chats, setChats, handleStream, isStreamProcessing } = useChatStream();
  const { modelList } = useModelList();

  useEffect(() => {
    if (selectedModel != null) {
      setChats((prevArray) => [...prevArray, { content: systemPrompt || '', role: ChatRole.SYSTEM }]);
      setTextareaPlaceholder('Ask me anything...');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModel]);

  const chatStream = async (message: TChatMessage) => {
    if (selectedModel == null || selectedService == null) {
      return;
    }

    setIsFetchLoading(true);
    const streamReader = await api.getChatStream(
      selectedModel,
      [...chats, message],
      selectedService.url,
      selectedService.apiKey
    );
    setIsFetchLoading(false);
    await handleStream(streamReader);
  };

  const sendChat = async (chatInput: string) => {
    if (chatInput === '') {
      return;
    }
    const chatMessage = { content: chatInput, role: ChatRole.USER };
    setChats((prevArray) => [...prevArray, chatMessage]);
    await chatStream(chatMessage);
    delayHighlighter();
  };

  return (
    <>
      <main className="flex-1 space-y-4 overflow-y-auto px-3" ref={mainDiv}>
        {modelList.modelsIsError && <AlertBox title="Error" description={modelList.modelsError?.message ?? ''} />}
        <ModelAlts
          embeddingModels={false}
          selectedService={selectedService}
          selectedModel={selectedModel}
          models={modelList.models || []}
          modelsIsSuccess={modelList.modelsIsSuccess}
          modelsIsLoading={modelList.modelsIsLoading}
          hasHydrated={hasHydrated}
          onModelChange={(model) => {
            setModel(model);
          }}
          onServiceChange={(service) => {
            setService(service);
            setModel(null);
          }}
          onReset={() => {
            setService(null);
            setModel(null);
            setChats([]);
            setTextareaPlaceholder('Choose model...');
          }}
        />

        {selectedModel != null && chats.length === 1 && (
          <h2 className="mt-10 scroll-m-20 pb-2 text-center text-3xl font-semibold tracking-tight transition-colors first:mt-0">
            How can I help you today?
          </h2>
        )}

        <Chat isFetchLoading={isFetchLoading} chats={chats} mainDiv={mainDiv} />
      </main>
      <section className="sticky top-[100vh] py-3">
        <ChatInput
          onSendInput={sendChat}
          onCancelStream={api.cancelChatStream}
          chatInputPlaceholder={textareaPlaceholder}
          isStreamProcessing={isStreamProcessing}
          isFetchLoading={isFetchLoading}
          isLlmModelActive={selectedModel != null}
        />
      </section>
    </>
  );
}
