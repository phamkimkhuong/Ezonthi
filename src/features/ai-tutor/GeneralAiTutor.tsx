import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../services/store';
import { aiService } from '../../services/aiService';
import { db, firebaseStorage } from '../../services/firebase';
import { doc, onSnapshot, setDoc, deleteDoc, collection, query, orderBy, getDoc, getDocs, limit } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { MathLoginRequired } from '../../components/common/MathLoginRequired';
import { getSubjectName } from '../../utils/subject';
import { X } from 'lucide-react';

import { SUBJECT_SUGGESTIONS_MAP, buildAiTutorSystemInstruction } from './constants/aiTutorPrompts';
import { AiTutorHeader } from './components/AiTutorHeader';
import { AiTutorSidebar, type ChatSession } from './components/AiTutorSidebar';
import { AiTutorMessageList, type Message } from './components/AiTutorMessageList';
import { AiTutorInput } from './components/AiTutorInput';
import { AiTutorDiagnostics } from './components/AiTutorDiagnostics';
import { ImageLightboxModal } from './components/ImageLightboxModal';
import {
  appendChatMessages,
  deleteChatSession,
  loadChatMessagesPage,
  migrateLegacyChatMessages,
} from '../../services/chatHistoryService';

interface SubjectProfile {
  strengths?: string[];
  weaknesses?: string[];
  learningSummary?: string;
  lastUpdated?: any;
}

interface StudentProfile {
  math?: SubjectProfile;
  english?: SubjectProfile;
  chemistry?: SubjectProfile;
  physics?: SubjectProfile;
  biology?: SubjectProfile;
  strengths?: string[];
  weaknesses?: string[];
  learningSummary?: string;
  lastUpdated?: any;
}

const generateChatStoragePath = (userId: string, chatPathKey: string, fileName: string) => {
  const fileExtension = fileName.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  return `users/${userId}/general_chats/${chatPathKey}/msg_img_${timestamp}.${fileExtension}`;
};

const legacyDateToIso = (value: unknown): string => {
  if (typeof value === 'string' && Number.isFinite(Date.parse(value))) return new Date(value).toISOString();
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  return new Date().toISOString();
};

export const GeneralAiTutor: React.FC = () => {
  const navigate = useNavigate();
  const { user, selectedGrade, selectedSubject: subject } = useAppStore();
  const chatPathKey = selectedGrade ? `${selectedGrade}_${subject}` : subject;

  const [showDiagnostics, setShowDiagnostics] = useState(() => {
    return localStorage.getItem('otv10_ai_show_diagnostics') !== 'false';
  });

  const toggleDiagnostics = () => {
    setShowDiagnostics(prev => {
      const next = !prev;
      localStorage.setItem('otv10_ai_show_diagnostics', String(next));
      return next;
    });
  };

  const handleDiagnosticsClick = () => {
    if (window.innerWidth < 1024) {
      setIsMobileDiagOpen(true);
    } else {
      toggleDiagnostics();
    }
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [nextMessageCursor, setNextMessageCursor] = useState<number | null>(null);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isNewSessionDraft, setIsNewSessionDraft] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const [isMobileDiagOpen, setIsMobileDiagOpen] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [activeLightboxUrl, setActiveLightboxUrl] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>([]);
  const hasNewMessages = useRef(false);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runDiagnosisRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const convertFileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        resolve({
          data: base64Data,
          mimeType: file.type
        });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const processImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Chỉ hỗ trợ gửi các file hình ảnh.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Dung lượng hình ảnh phải nhỏ hơn 5MB.');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      if (runDiagnosisRef.current) {
        runDiagnosisRef.current();
      }
    }, 3 * 60 * 1000);
  }, []);

  useEffect(() => {
    hasNewMessages.current = false;
    resetInactivityTimer();
    const currentSubject = subject;

    const runDiagnosis = () => {
      if (hasNewMessages.current && messagesRef.current.length > 1) {
        const chatHistoryForDiagnosis = messagesRef.current.map(m => ({
          role: m.role,
          text: m.text
        }));
        aiService.diagnoseSession(chatHistoryForDiagnosis, currentSubject);
        hasNewMessages.current = false;
      }
    };

    runDiagnosisRef.current = runDiagnosis;

    return () => {
      runDiagnosis();
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [subject, resetInactivityTimer]);

  // Lắng nghe hồ sơ học sinh realtime
  useEffect(() => {
    if (!user?.uid) return;
    setIsLoadingProfile(true);
    const profileRef = doc(db, 'student_profiles', user.uid);

    const unsubscribe = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as StudentProfile);
      } else {
        setProfile(null);
      }
      setIsLoadingProfile(false);
    }, (err) => {
      console.error("Lỗi khi lắng nghe hồ sơ học sinh:", err);
      setIsLoadingProfile(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Tải danh sách cuộc trò chuyện cho môn học theo Lớp
  useEffect(() => {
    if (!user?.uid) return;

    setIsLoadingSessions(true);
    const sessionsCollectionRef = collection(db, 'users', user.uid, 'general_chats', chatPathKey, 'sessions');
    const q = query(sessionsCollectionRef, orderBy('updatedAt', 'desc'), limit(50));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const loadedSessions: ChatSession[] = [];
      querySnapshot.forEach((docSnap) => {
        loadedSessions.push({
          id: docSnap.id,
          ...docSnap.data()
        } as ChatSession);
      });

      // Di trú legacy
      if (loadedSessions.length === 0) {
        try {
          // 1. Kiểm tra legacy single doc: general_chats/${subject}
          const legacyDocRef = doc(db, 'users', user.uid, 'general_chats', subject);
          const legacyDocSnap = await getDoc(legacyDocRef);
          if (legacyDocSnap.exists()) {
            const legacyData = legacyDocSnap.data();
            if (legacyData && Array.isArray(legacyData.messages) && legacyData.messages.length > 0) {
              const newSessionDocRef = doc(sessionsCollectionRef);
              const firstMsg = legacyData.messages.find((m: any) => m.role === 'user');
              const title = firstMsg ? (firstMsg.text.substring(0, 30) + (firstMsg.text.length > 30 ? '...' : '')) : "Cuộc trò chuyện cũ";

              await setDoc(newSessionDocRef, {
                title,
                messageCount: 0,
                storageVersion: 2,
                subjectId: subject,
                gradeId: selectedGrade,
                createdAt: legacyDateToIso(legacyData.updatedAt),
                updatedAt: legacyDateToIso(legacyData.updatedAt)
              });
              await migrateLegacyChatMessages(user.uid, chatPathKey, newSessionDocRef.id, legacyData.messages);

              await deleteDoc(legacyDocRef);
              return;
            }
          }

          // 2. Kiểm tra legacy sessions cũ chưa phân lớp: general_chats/${subject}/sessions (di trú nếu là Lớp 9)
          if ((!selectedGrade || selectedGrade === 'grade9') && chatPathKey !== subject) {
            const legacySessionsRef = collection(db, 'users', user.uid, 'general_chats', subject, 'sessions');
            const legacySnapshot = await getDocs(legacySessionsRef);
            if (!legacySnapshot.empty) {
              for (const legacySnap of legacySnapshot.docs) {
                const legacySessionData = legacySnap.data();
                const targetDocRef = doc(sessionsCollectionRef, legacySnap.id);
                const legacyMessages = Array.isArray(legacySessionData.messages) ? legacySessionData.messages : [];
                const legacyTimestamp = legacyDateToIso(legacySessionData.updatedAt || legacySessionData.createdAt);
                await setDoc(targetDocRef, {
                  title: String(legacySessionData.title || 'Cuộc trò chuyện cũ').slice(0, 120),
                  messageCount: 0,
                  storageVersion: 2,
                  gradeId: selectedGrade || 'grade9',
                  subjectId: subject,
                  createdAt: legacyDateToIso(legacySessionData.createdAt || legacyTimestamp),
                  updatedAt: legacyTimestamp,
                });
                if (legacyMessages.length > 0) await migrateLegacyChatMessages(user.uid, chatPathKey, legacySnap.id, legacyMessages);
                await deleteDoc(doc(legacySessionsRef, legacySnap.id));
              }
              return;
            }
          }
        } catch (err) {
          console.error("Lỗi khi di trú cuộc hội thoại cũ:", err);
        }
      }

      setSessions(loadedSessions);
      setIsLoadingSessions(false);

      if (loadedSessions.length > 0) {
        setActiveSessionId((prev) => {
          if (prev && loadedSessions.some((s) => s.id === prev)) {
            return prev;
          }
          return loadedSessions[0].id;
        });
        setIsNewSessionDraft(false);
      } else {
        setActiveSessionId(null);
        setIsNewSessionDraft(true);
      }
    }, (err) => {
      console.error("Lỗi khi tải lịch sử cuộc trò chuyện:", err);
      setIsLoadingSessions(false);
    });

    return () => unsubscribe();
  }, [user?.uid, subject, selectedGrade, chatPathKey]);

  // Nạp nội dung tin nhắn của session đang active
  useEffect(() => {
    if (isNewSessionDraft || !activeSessionId) {
      setMessages([]);
      return;
    }
    const currentSession = sessions.find((s) => s.id === activeSessionId);
    let cancelled = false;
    const loadMessages = async () => {
      try {
        if (currentSession && Array.isArray(currentSession.messages) && currentSession.messages.length > 0 && user?.uid) {
          await migrateLegacyChatMessages(user.uid, chatPathKey, activeSessionId, currentSession.messages);
        }
        if (!user?.uid) return;
        const page = await loadChatMessagesPage(user.uid, chatPathKey, activeSessionId);
        if (!cancelled) {
          setMessages(page.messages);
          setNextMessageCursor(page.nextCursor);
        }
      } catch (error) {
        console.error('Lỗi khi tải trang lịch sử chat:', error);
        if (!cancelled) setMessages([]);
      }
    };
    void loadMessages();
    return () => { cancelled = true; };
  }, [activeSessionId, sessions, isNewSessionDraft, user?.uid, chatPathKey]);

  const handleLoadOlderMessages = async () => {
    if (!user?.uid || !activeSessionId || nextMessageCursor === null || isLoadingOlderMessages) return;
    setIsLoadingOlderMessages(true);
    try {
      const page = await loadChatMessagesPage(user.uid, chatPathKey, activeSessionId, nextMessageCursor);
      setMessages(current => [...page.messages, ...current]);
      setNextMessageCursor(page.nextCursor);
    } catch (error) {
      console.error('Lỗi khi tải thêm lịch sử chat:', error);
    } finally {
      setIsLoadingOlderMessages(false);
    }
  };

  // Cuộn xuống tin nhắn cuối
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleClearHistory = async () => {
    if (!user?.uid || !activeSessionId) {
      setMessages([]);
      setIsNewSessionDraft(true);
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa cuộc trò chuyện này không?")) {
      try {
        await deleteChatSession(user.uid, chatPathKey, activeSessionId);
        setMessages([]);
        setActiveSessionId(null);
        setIsNewSessionDraft(true);
      } catch (err) {
        console.error("Lỗi khi xóa cuộc trò chuyện:", err);
        alert("Không thể xóa cuộc trò chuyện. Vui lòng thử lại.");
      }
    }
  };

  const handleDeleteSession = async (sessionIdToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.uid) return;

    if (window.confirm("Bạn có chắc chắn muốn xóa cuộc trò chuyện này không?")) {
      try {
        await deleteChatSession(user.uid, chatPathKey, sessionIdToDelete);
        if (activeSessionId === sessionIdToDelete) {
          setActiveSessionId(null);
          setIsNewSessionDraft(true);
          setMessages([]);
        }
      } catch (err) {
        console.error("Lỗi khi xóa cuộc trò chuyện:", err);
        alert("Không thể xóa cuộc trò chuyện.");
      }
    }
  };

  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const textToSend = customText !== undefined ? customText : input;
    if ((!textToSend.trim() && !selectedFile) || isLoading || errorMsg === "LIMIT_EXHAUSTED") return;

    const fileToSend = selectedFile;
    const previewToSend = previewUrl;

    if (!customText) setInput('');
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setIsLoading(true);
    let uploadedImageUrl: string | undefined = undefined;
    let base64Image: { data: string; mimeType: string } | undefined = undefined;

    let currentSessionId = activeSessionId;
    let isNewSession = false;
    let sessionTitle = "";
    let persistedUserMessage = false;

    if (isNewSessionDraft || !currentSessionId) {
      if (user?.uid) {
        const sessionsCollectionRef = collection(db, 'users', user.uid, 'general_chats', chatPathKey, 'sessions');
        currentSessionId = doc(sessionsCollectionRef).id;
      } else {
        currentSessionId = `temp_${Date.now()}`;
      }
      isNewSession = true;
      sessionTitle = textToSend ? (textToSend.substring(0, 30) + (textToSend.length > 30 ? '...' : '')) : "Hình ảnh bài làm";
    }

    try {
      if (fileToSend) {
        setIsUploadingImage(true);
        base64Image = await convertFileToBase64(fileToSend);

        if (user?.uid) {
          const userId = user.uid;
          const storagePath = generateChatStoragePath(userId, chatPathKey, fileToSend.name);
          const storageRef = ref(firebaseStorage, storagePath);

          const uploadTask = uploadBytesResumable(storageRef, fileToSend);
          await new Promise<void>((resolve, reject) => {
            uploadTask.on('state_changed', null, (error) => reject(error), () => resolve());
          });
          uploadedImageUrl = await getDownloadURL(storageRef);
        }
        setIsUploadingImage(false);
      }

      const newUserMsg: Message = {
        role: 'user',
        text: textToSend,
        ...(uploadedImageUrl ? { imageUrl: uploadedImageUrl } : {})
      };

      const updatedMessages = isNewSession ? [newUserMsg] : [...messages, newUserMsg];
      setMessages(updatedMessages);

      await appendChatMessages(user.uid, chatPathKey, currentSessionId, [newUserMsg], isNewSession ? {
        title: sessionTitle,
        subjectId: subject,
        gradeId: selectedGrade,
      } : undefined);
      persistedUserMessage = true;

      if (isNewSession) {
        setActiveSessionId(currentSessionId);
        setIsNewSessionDraft(false);
      }

      hasNewMessages.current = true;
      resetInactivityTimer();

      const systemInstruction = buildAiTutorSystemInstruction(subject, selectedGrade);

      const contents = updatedMessages.slice(-8).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const reply = await aiService.callGemini({
        contents,
        systemInstruction,
        useRag: true,
        subjectId: subject,
        gradeId: selectedGrade,
        ragVersion: '2026.09',
        taskType: 'tutor',
        temperature: 0.7,
        skipDiagnosis: true,
        chatId: currentSessionId,
        image: base64Image
      });

      const finalMessages = [...updatedMessages, { role: 'model', text: reply } as Message];
      setMessages(finalMessages);
      await appendChatMessages(user.uid, chatPathKey, currentSessionId, [{ role: 'model', text: reply }]);
    } catch (err: any) {
      console.error("Lỗi khi gửi tin nhắn cho AI:", err);
      setIsUploadingImage(false);
      const isLimitError = err.message?.includes("Hôm nay bạn đã dùng hết hạn mức") || err.message?.includes("resource-exhausted");

      const errorText = isLimitError
        ? "⚠️ Bạn đã hết hạn mức 20 lượt hỏi AI miễn phí trong ngày hôm nay. Hãy nâng cấp gói Premium để tiếp tục chat không giới hạn với Gia sư AI!"
        : `⚠️ Lỗi kết nối: ${err.message || 'Không thể liên lạc được với Gia sư AI.'}`;

      if (isLimitError) {
        setErrorMsg("LIMIT_EXHAUSTED");
      }

      const newUserMsg: Message = {
        role: 'user',
        text: textToSend,
        ...(uploadedImageUrl ? { imageUrl: uploadedImageUrl } : {})
      };

      const finalMessages = [...messages, newUserMsg, { role: 'model', text: errorText } as Message];
      setMessages(finalMessages);
      if (currentSessionId && user?.uid) {
        const failureMessages: Message[] = [
          ...(persistedUserMessage ? [] : [newUserMsg]),
          { role: 'model', text: errorText },
        ];
        await appendChatMessages(user.uid, chatPathKey, currentSessionId, failureMessages, isNewSession && !persistedUserMessage ? {
          title: sessionTitle,
          subjectId: subject,
          gradeId: selectedGrade,
        } : undefined);
      }
    } finally {
      setIsLoading(false);
      setIsUploadingImage(false);
      if (previewToSend) {
        URL.revokeObjectURL(previewToSend);
      }
    }
  };

  // Student Profile Diagnostics calculation
  const cleanSubject = subject || 'math';
  const subProfile = profile?.[cleanSubject as keyof Omit<StudentProfile, 'strengths' | 'weaknesses' | 'learningSummary' | 'lastUpdated'>] as SubjectProfile | undefined;

  let strengths: string[] = subProfile?.strengths || [];
  let weaknesses: string[] = subProfile?.weaknesses || [];
  let learningSummary = subProfile?.learningSummary || "";
  let lastUpdated = subProfile?.lastUpdated;

  if (cleanSubject === "math" && profile && !profile.math) {
    if (profile.strengths) strengths = profile.strengths;
    if (profile.weaknesses) weaknesses = profile.weaknesses;
    if (profile.learningSummary) learningSummary = profile.learningSummary;
    if (profile.lastUpdated) lastUpdated = profile.lastUpdated;
  }

  const hasProfileData = strengths.length > 0 || weaknesses.length > 0 || !!learningSummary;
  const suggestions = SUBJECT_SUGGESTIONS_MAP[subject] || SUBJECT_SUGGESTIONS_MAP.math;

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-110px)] lg:h-[calc(100vh-100px)] overflow-hidden p-0 gap-3 bg-slate-50/50 dark:bg-slate-950/20 relative">
      {/* Cột trái: Khung Chat */}
      <div className="flex-1 flex flex-row bg-card border border-border/80 rounded-2xl shadow-xl overflow-hidden h-full relative">
        <AiTutorSidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          sessions={sessions}
          activeSessionId={activeSessionId}
          setActiveSessionId={setActiveSessionId}
          isLoadingSessions={isLoadingSessions}
          onNewSession={() => {
            if (!user) {
              setShowAuthModal(true);
              return;
            }
            setIsNewSessionDraft(true);
            setActiveSessionId(null);
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
          }}
          onDeleteSession={handleDeleteSession}
          isLoggedIn={!!user}
          onRequireLogin={() => setShowAuthModal(true)}
        />

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <AiTutorHeader
            subject={subject}
            selectedGrade={selectedGrade}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            showDiagnostics={showDiagnostics}
            onDiagnosticsClick={handleDiagnosticsClick}
            onClearHistory={handleClearHistory}
          />

          <AiTutorMessageList
            messages={messages}
            isLoading={isLoading}
            isUploadingImage={isUploadingImage}
            suggestions={suggestions}
            errorMsg={errorMsg}
            onSendSuggestion={(s) => handleSend(undefined, s)}
            onImageClick={(url) => setActiveLightboxUrl(url)}
            onUpgradeClick={() => navigate('/premium')}
            hasOlderMessages={nextMessageCursor !== null}
            isLoadingOlderMessages={isLoadingOlderMessages}
            onLoadOlderMessages={handleLoadOlderMessages}
            messagesEndRef={messagesEndRef}
            isLoggedIn={!!user}
            onRequireLogin={() => setShowAuthModal(true)}
            subjectName={getSubjectName(subject)}
          />

          <AiTutorInput
            input={input}
            setInput={setInput}
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            isLoading={isLoading}
            isUploadingImage={isUploadingImage}
            errorMsg={errorMsg}
            placeholder={`Hỏi Gia sư ${getSubjectName(subject)} hoặc dán (Ctrl+V) ảnh bài làm...`}
            fileInputRef={fileInputRef}
            onImageChange={handleImageChange}
            onPasteImage={processImageFile}
            onRemoveImage={handleRemoveImage}
            onSubmit={(e) => handleSend(e)}
            isLoggedIn={!!user}
            onRequireLogin={() => setShowAuthModal(true)}
          />
        </div>
      </div>

      {/* Cột phải: Hồ sơ năng lực Desktop */}
      {showDiagnostics && (
        <AiTutorDiagnostics
          isLoadingProfile={isLoadingProfile}
          hasProfileData={hasProfileData}
          learningSummary={learningSummary}
          strengths={strengths}
          weaknesses={weaknesses}
          lastUpdated={lastUpdated}
          isLoggedIn={!!user}
          onRequireLogin={() => setShowAuthModal(true)}
        />
      )}

      {/* Mobile Hồ sơ năng lực Bottom Sheet */}
      {isMobileDiagOpen && (
        <AiTutorDiagnostics
          isMobile
          onCloseMobile={() => setIsMobileDiagOpen(false)}
          isLoadingProfile={isLoadingProfile}
          hasProfileData={hasProfileData}
          learningSummary={learningSummary}
          strengths={strengths}
          weaknesses={weaknesses}
          lastUpdated={lastUpdated}
          isLoggedIn={!!user}
          onRequireLogin={() => setShowAuthModal(true)}
        />
      )}

      <ImageLightboxModal
        activeLightboxUrl={activeLightboxUrl}
        onClose={() => setActiveLightboxUrl(null)}
      />

      {/* Modal Popup Yêu Cầu Đăng Nhập khi khách bấm tương tác */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setShowAuthModal(false)}
        >
          <div 
            className="relative w-full max-w-lg animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-10 right-2 sm:right-4 z-20 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
              title="Đóng"
            >
              <X size={18} />
            </button>
            <MathLoginRequired
              title="Trò chuyện cùng Gia sư AI"
              description="Đăng nhập bằng tài khoản Google để gửi câu hỏi, giải bài tập qua hình ảnh và lưu lại toàn bộ tiến độ học tập cùng Gia sư Socratic!"
              onBack={() => setShowAuthModal(false)}
              backText="Tiếp tục xem trước"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralAiTutor;
