import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Paper, Typography, InputAdornment } from '@mui/material';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import SendIcon from '@mui/icons-material/Send';
import ReactMarkdown from 'react-markdown';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTheme } from '@mui/material/styles';

interface Message {
  type: 'user' | 'bot';
  content: string;
  isFAQ?: boolean;  // Add this field to distinguish FAQ messages
  suggestions?: string[];  // Add this field for FAQ suggestions
  isStreaming?: boolean;  // Add this field to handle streaming messages
}

interface FinancialChatboxProps {
  ticker: string;  // Current ticker passed from parent component
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080'

const LoadingMessage = () => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    {[1, 2, 3].map((dot) => (
      <Box
        key={dot}
        sx={{
          width: 8,
          height: 8,
          backgroundColor: 'grey.400',
          borderRadius: '50%',
          animation: 'pulse 1.5s infinite',
          animationDelay: `${(dot - 1) * 0.2}s`,
          '@keyframes pulse': {
            '0%, 100%': {
              transform: 'scale(0.8)',
              opacity: 0.5,
            },
            '50%': {
              transform: 'scale(1.2)',
              opacity: 1,
            },
          },
        }}
      />
    ))}
  </Box>
);

const FinancialChatbox: React.FC<FinancialChatboxProps> = ({ ticker }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [hasFetchedFAQs, setHasFetchedFAQs] = useState(false);
  const [isFAQLoading, setIsFAQLoading] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    setHasFetchedFAQs(false);
  }, [ticker]);

  const handleFAQClick = async (question: string) => {
    setInput(question);
    // Simulate form submission with the selected question
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    await handleSubmit(fakeEvent, question);
  };

  const handleSubmit = async (e: React.FormEvent, forcedInput?: string) => {
    e.preventDefault();
    const questionToAsk = forcedInput || input;
    if (!questionToAsk.trim()) return;

    // Add user message to chat
    const userMessage: Message = { type: 'user', content: questionToAsk };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/company/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: questionToAsk, ticker: ticker }),
      });

      if (!response.ok) {
        throw new Error('Failed to get analysis');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Failed to get reader');
      }

      // Add initial streaming message
      const streamingMessage: Message = {
        type: 'bot',
        content: '',
        isStreaming: true
      };
      setMessages(prev => [...prev, streamingMessage]);

      // Read the stream
      let accumulatedContent = '';
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        accumulatedContent += chunk;

        // Update the streaming message content with the full accumulated content
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];

          if (lastMessage.isStreaming) {
            lastMessage.content = accumulatedContent;
          }
          return newMessages;
        });
      }

      // Mark message as no longer streaming once complete
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.isStreaming) {
          lastMessage.isStreaming = false;
        }
        return newMessages;
      });

    } catch (error) {
      // Add error message to chat
      const errorMessage: Message = {
        type: 'bot',
        content: 'Sorry, I encountered an error analyzing the data.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isScrollable = element.scrollHeight > element.clientHeight;
    setShowScrollButton(isScrollable);
  };

  useEffect(() => {
    const chatBox = messagesEndRef.current?.parentElement;
    if (chatBox) {
      const isScrollable = chatBox.scrollHeight > chatBox.clientHeight;
      setShowScrollButton(isScrollable);
    }
  }, [messages]);

  const fetchFAQsStream = async() => {
    setIsFAQLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/company/faq?ticker=${ticker}&stream=true`);
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('Failed to get reader');
      }
      
      const questions: string[] = [];
      let hasAddedInitialStatus = false;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const {value, done} = await reader.read();
        if (done) break;
        
        const lines = decoder.decode(value).split('\n');
        
        for (const line of lines) {
          if (line.trim()) {
            const jsonString = line.replace(/^data: /, '');
            const data = JSON.parse(jsonString);
            switch (data.type) {
              case 'question':
                questions.push(data.text);
                // Update or create FAQ message
                setMessages(prev => {
                  const newMessages = [...prev];
                  const faqMessage = newMessages.find(m => m.isFAQ);
                  if (faqMessage) {
                    faqMessage.suggestions = questions;
                  } else {
                    newMessages.push({
                      type: 'bot',
                      content: "",
                      isFAQ: true,
                      suggestions: questions
                    });
                  }
                  return newMessages;
                });
                break;
              case 'status':
                if (!hasAddedInitialStatus) {
                  // Add first status message as a separate chat message
                  setMessages(prev => [...prev, {
                    type: 'bot',
                    content: data.message
                  }]);
                  hasAddedInitialStatus = true;
                }
                break;
              case 'error':
                console.error('Error:', data.message);
                break;
            }
          }
        }
      }

      // Update the FAQ message when stream is complete
      setMessages(prev => {
        const newMessages = [...prev];
        const faqMessage = newMessages.find(m => m.isFAQ);
        if (faqMessage) {
          faqMessage.suggestions = questions;
        }
        return newMessages;
      });
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      // Add error message if stream fails
      setMessages(prev => [...prev, {
        type: 'bot',
        content: "Sorry, I encountered an error generating questions.",
        isFAQ: true,
        suggestions: []
      }]);
    } finally {
      setIsFAQLoading(false);
    }
  };

  const handleChatOpen = () => {
    setIsVisible(true);
    if (!hasFetchedFAQs) {
      fetchFAQsStream();
      setHasFetchedFAQs(true);
    }
  };

  const MessageContent: React.FC<{ content: string, isUser: boolean, isFAQ?: boolean, suggestions?: string[] }> = 
    ({ content, isUser, isFAQ, suggestions }) => {
    if (isUser) {
      return (
        <Typography 
          variant="h4" 
          sx={{ 
            fontSize: '1.75rem',
            fontWeight: 500,
            mb: 3,
            color: 'text.primary',
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          {content}
        </Typography>
      );
    }

    if (isFAQ && suggestions) {
      return (
        <Box>
          <Typography sx={{ mb: 1 }}>{content}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outlined"
                size="small"
                onClick={() => handleFAQClick(suggestion)}
                sx={{
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  textTransform: 'none',
                  p: 1,
                  borderColor: 'grey.300',
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    borderColor: 'primary.main',
                  }
                }}
              >
                {suggestion}
              </Button>
            ))}
          </Box>
        </Box>
      );
    }
    
    return (
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: 'grey.100',
            borderRadius: '16px',
            padding: '4px 16px 4px 8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            width: 'fit-content',
            mb: 1.5
          }}
        >
          <Box
            component="img"
            src="/stonkie.png"
            alt="Stonkie Avatar"
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              flexShrink: 0,
            }}
          />
          <Typography 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 'bold'
            }}
          >
            Stonkie
          </Typography>
        </Box>
        <Box>
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1, mb: 2 }}>
                  {children}
                </Typography>
              ),
              p: ({ children }) => (
                <Typography sx={{ mb: 1.5, color: 'text.primary' }}>{children}</Typography>
              ),
              strong: ({ children }) => (
                <Typography component="span" sx={{ fontWeight: 'bold' }}>
                  {children}
                </Typography>
              ),
              ul: ({ children }) => (
                <Box component="ul" sx={{ pl: 2, mb: 1.5 }}>
                  {children}
                </Box>
              ),
              li: ({ children }) => (
                <Typography component="li" sx={{ mb: 0.5 }}>
                  {children}
                </Typography>
              ),
              table: ({ children }) => (
                <Box sx={{ overflowX: 'auto', mb: 2 }}>
                  <table style={{ 
                    borderCollapse: 'collapse', 
                    width: '100%',
                    fontSize: '0.875rem'
                  }}>
                    {children}
                  </table>
                </Box>
              ),
              th: ({ children }) => (
                <th style={{ 
                  border: '1px solid #ddd',
                  padding: '8px',
                  backgroundColor: '#f5f5f5',
                  textAlign: 'left'
                }}>
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td style={{ 
                  border: '1px solid #ddd',
                  padding: '8px'
                }}>
                  {children}
                </td>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: { xs: 0, sm: 20 },
      right: { xs: 0, sm: 20 },
      maxWidth: { xs: '100%', sm: '90%' },
      width: { xs: '100%', sm: 800 },
      px: { xs: 0, sm: 0 }
    }}>
      {!isVisible && (
        <Button 
          onClick={handleChatOpen}
          variant="contained" 
          sx={{ 
            minWidth: 'auto',
            width: 56,
            height: 56,
            borderRadius: '50%',
            float: 'right',
            mr: { xs: 4, sm: 0 },
            mb: { xs: 4, sm: 0 }
          }}
        >
          <ChatBubbleIcon />
        </Button>
      )}
      
      {isVisible && (
        <Paper elevation={3} sx={{ 
          p: 4,
          clear: 'both', 
          position: 'relative',
          borderRadius: { xs: '16px 16px 0 0', sm: 4 }
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider',
            pb: 1,
            mb: 2
          }}>
            <Typography variant="h6" sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1
            }}>
              Chat with Stonkie about {ticker}
            </Typography>
            <Button 
              onClick={() => setIsVisible(false)}
              sx={{ 
                minWidth: 'auto',
                width: 32,
                height: 32,
                p: 0,
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <Typography sx={{ fontSize: '20px' }}>✕</Typography>
            </Button>
          </Box>
          
          <Box sx={{ 
            height: {
              xs: '75vh',
              sm: '65vh'
            },
            overflowY: 'auto',
            mb: 3,
            position: 'relative',
            mr: -2,
            pr: 2,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            },
          }}
          onScroll={handleScroll}>
            {showScrollButton && (
              <Box sx={{ 
                position: 'sticky',
                top: '1px',
                left: '1px',
                zIndex: 1,
                ml: 2,
                marginLeft: 0
              }}>
                <Button
                  onClick={scrollToBottom}
                  size="small"
                  sx={{
                    minWidth: '32px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    padding: 0,
                    backgroundColor: 'background.paper',
                    boxShadow: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <KeyboardArrowDownIcon />
                </Button>
              </Box>
            )}
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  mb: 4,
                  position: 'relative',
                }}
              >
                <MessageContent 
                  content={message.content} 
                  isUser={message.type === 'user'}
                  isFAQ={message.isFAQ}
                  suggestions={message.suggestions}
                />
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          <form onSubmit={(e) => handleSubmit(e)} style={{ marginBottom: '12px' }}>
            <TextField
              fullWidth
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about financial analysis..."
              disabled={isLoading}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  pr: '8px',
                  '& input': {
                    py: 1.5
                  }
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button 
                      type="submit" 
                      disabled={isLoading || !input.trim()}
                      sx={{
                        minWidth: '40px',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        p: 0,
                      }}
                    >
                      <SendIcon fontSize="small" />
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </form>
        </Paper>
      )}
    </Box>
  );
};

export default FinancialChatbox; 