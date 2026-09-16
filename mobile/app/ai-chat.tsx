import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Bot, User, Send, ArrowLeft, Trash2, Sparkles, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { askAiTutor, ChatMessage, QuestionContext, normalizeSubjectCode } from '../services/aiTutorService';
import { SUBJECT_SUGGESTIONS_MAP } from '../services/aiTutorPrompts';
import MathRenderer from '../components/MathRenderer';

export default function AiChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    questionId?: string;
    questionText?: string;
    options?: string;
    correctAnswer?: string;
    explanation?: string;
    subjectId?: string;
    subjectName?: string;
    topicName?: string;
  }>();

  const [context, setContext] = useState<QuestionContext>({});
  const [showContext, setShowContext] = useState<boolean>(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    let parsedOptions: string[] | undefined;
    if (params.options) {
      try {
        parsedOptions = JSON.parse(params.options);
      } catch {
        parsedOptions = undefined;
      }
    }

    const questionContext: QuestionContext = {
      questionId: params.questionId,
      questionText: params.questionText,
      options: parsedOptions,
      correctAnswer: params.correctAnswer !== undefined ? parseInt(params.correctAnswer, 10) : undefined,
      explanation: params.explanation,
      subjectId: params.subjectId,
      subjectName: params.subjectName,
      topicName: params.topicName,
    };

    setContext(questionContext);

    // Khởi tạo tin nhắn chào đầu tiên từ Thầy EZ
    const initialGreeting = questionContext.questionText
      ? `Chào em! Thầy EZ đã nhận được câu hỏi môn **${questionContext.subjectName || 'Học tập'}** (${questionContext.topicName || 'Chuyên đề'}).\n\nEm đang gặp khó khăn ở bước nào? Hãy chọn một gợi ý nhanh bên dưới hoặc nhắn trực tiếp cho thầy nhé!`
      : `Chào em! Thầy EZ là trợ lý AI đồng hành cùng em ôn thi vào lớp 10. Em có câu hỏi hoặc bài tập nào cần thầy hướng dẫn phương pháp giải không?`;

    setMessages([
      {
        id: 'msg-0',
        sender: 'tutor',
        text: initialGreeting,
        timestamp: Date.now()
      }
    ]);
  }, [params.questionId]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputText).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    // Cuộn xuống cuối
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await askAiTutor(textToSend, context, messages);
      const tutorMessage: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: response,
        timestamp: Date.now()
      };
      setMessages([...newMessages, tutorMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: 'Thầy xin lỗi, kết nối mạng đang chập chờn. Em hãy thử bấm lại hoặc gửi lại câu hỏi nhé!',
        timestamp: Date.now()
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'tutor',
        text: 'Thầy đã làm mới cuộc trò chuyện. Em hãy đặt câu hỏi mới nhé!',
        timestamp: Date.now()
      }
    ]);
  };

  const subjectCode = normalizeSubjectCode(context.subjectId);
  const subjectSuggestions = SUBJECT_SUGGESTIONS_MAP[subjectCode] || SUBJECT_SUGGESTIONS_MAP.math;

  const quickPrompts = context.questionText
    ? [
        { label: '💡 Gợi ý bước 1', prompt: 'Thầy gợi ý cho em bước đầu tiên để tiếp cận bài này với ạ.' },
        { label: '🤔 Vì sao em sai?', prompt: 'Thầy giải thích giúp em vì sao câu này học sinh hay nhầm lẫn?' },
        { label: '📖 Nhắc lại lý thuyết', prompt: 'Thầy tóm tắt giúp em công thức và lý thuyết trọng tâm của câu này.' },
        { label: '🎯 Đưa ví dụ mẫu', prompt: 'Thầy cho em một ví dụ tương tự đơn giản hơn để em dễ hình dung nhé.' },
        ...subjectSuggestions.slice(0, 2).map((s) => ({ label: `❓ ${s.substring(0, 22)}...`, prompt: s }))
      ]
    : subjectSuggestions.map((s) => ({
        label: `💬 ${s.length > 28 ? s.substring(0, 28) + '...' : s}`,
        prompt: s
      }));

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-slate-200 flex-row items-center justify-between shadow-sm">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-3 active:bg-slate-200"
          >
            <ArrowLeft size={20} color="#334155" />
          </TouchableOpacity>
          <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center mr-2 border border-indigo-200">
            <Bot size={22} color="#4F46E5" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-base font-bold text-slate-800 mr-2">Thầy EZ (AI Gia Sư)</Text>
              <View className="bg-emerald-100 px-2 py-0.5 rounded-full">
                <Text className="text-[10px] font-bold text-emerald-700">Online</Text>
              </View>
            </View>
            <Text className="text-xs text-slate-500">Ôn luyện phương pháp Socratic 24/7</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleClearChat}
          className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center active:bg-red-50"
        >
          <Trash2 size={16} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Context Drawer (Hiển thị tóm tắt câu hỏi đang hỏi) */}
      {context.questionText && (
        <View className="bg-indigo-50/80 border-b border-indigo-100 px-4 py-2.5">
          <TouchableOpacity
            onPress={() => setShowContext(!showContext)}
            className="flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1 pr-2">
              <HelpCircle size={15} color="#4F46E5" className="mr-1.5" />
              <Text className="text-xs font-bold text-indigo-900" numberOfLines={1}>
                Đang hỏi về: {context.topicName || context.subjectName || 'Câu hỏi bài tập'}
              </Text>
            </View>
            {showContext ? <ChevronUp size={16} color="#4F46E5" /> : <ChevronDown size={16} color="#4F46E5" />}
          </TouchableOpacity>

          {showContext && (
            <View className="mt-2 bg-white p-2.5 rounded-xl border border-indigo-100 shadow-sm">
              <MathRenderer content={context.questionText} className="text-xs text-slate-700 leading-relaxed font-medium" />
              {context.options && context.options.length > 0 && (
                <View className="mt-2 pt-2 border-t border-slate-100 flex-row flex-wrap gap-1">
                  {context.options.map((opt, idx) => (
                    <View key={idx} className="bg-slate-50 px-2 py-1 rounded border border-slate-200 mr-1 mb-1">
                      <Text className="text-[11px] text-slate-600">
                        <Text className="font-bold text-indigo-600">{String.fromCharCode(65 + idx)}. </Text>
                        {opt}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Chat Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        className="flex-1"
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 24 }}
          renderItem={({ item }) => {
            const isUser = item.sender === 'user';
            return (
              <View className={`flex-row mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <View className="w-8 h-8 rounded-full bg-indigo-600 items-center justify-center mr-2 self-start mt-0.5 shadow-sm">
                    <Sparkles size={16} color="#FFFFFF" />
                  </View>
                )}
                <View
                  className={`max-w-[82%] px-4 py-3 rounded-2xl ${isUser
                      ? 'bg-indigo-600 rounded-tr-none shadow-sm'
                      : 'bg-white rounded-tl-none border border-slate-200 shadow-sm'
                    }`}
                >
                  {isUser ? (
                    <Text className="text-sm text-white font-medium leading-relaxed">{item.text}</Text>
                  ) : (
                    <MathRenderer
                      content={item.text}
                      className="text-sm text-slate-800 leading-relaxed"
                    />
                  )}
                </View>
                {isUser && (
                  <View className="w-8 h-8 rounded-full bg-slate-700 items-center justify-center ml-2 self-start mt-0.5">
                    <User size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>
            );
          }}
          ListFooterComponent={
            isLoading ? (
              <View className="flex-row items-center mb-4 pl-1">
                <View className="w-8 h-8 rounded-full bg-indigo-600 items-center justify-center mr-2">
                  <Sparkles size={16} color="#FFFFFF" />
                </View>
                <View className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200 flex-row items-center shadow-sm">
                  <ActivityIndicator size="small" color="#4F46E5" className="mr-2" />
                  <Text className="text-xs text-slate-500 font-medium">Thầy EZ đang suy nghĩ hướng dẫn...</Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Quick Prompts */}
        <View className="bg-white border-t border-slate-100 pt-2 pb-1 px-3">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={quickPrompts}
            keyExtractor={(_, index) => `quick-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                disabled={isLoading}
                onPress={() => handleSend(item.prompt)}
                className="bg-indigo-50/80 active:bg-indigo-100 border border-indigo-200/80 px-3 py-1.5 rounded-full mr-2 mb-1 flex-row items-center"
              >
                <Text className="text-xs font-semibold text-indigo-700">{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Input Bar */}
        <View className="bg-white px-4 py-2.5 border-t border-slate-200 flex-row items-center">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Hỏi thầy cách làm, lý thuyết..."
            placeholderTextColor="#94A3B8"
            multiline
            maxLength={1000}
            className="flex-1 bg-slate-100 rounded-2xl px-4 py-2.5 text-sm text-slate-800 max-h-24 mr-2"
          />
          <TouchableOpacity
            disabled={!inputText.trim() || isLoading}
            onPress={() => handleSend()}
            className={`w-11 h-11 rounded-2xl items-center justify-center ${inputText.trim() && !isLoading ? 'bg-indigo-600 shadow-sm' : 'bg-slate-200'
              }`}
          >
            <Send size={18} color={inputText.trim() && !isLoading ? '#FFFFFF' : '#94A3B8'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
