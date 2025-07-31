'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Quiz, QuizQuestion, QuestionType } from '@/lib/types/quiz-types';
import { defaultQuizSettings, createEmptyQuestion, calculateTotalPoints, generateQuestionId } from '@/lib/utils/quiz-helpers';
import EnhancedQuestionTypeSelector from '@/components/quiz/EnhancedQuestionTypeSelector';
import EnhancedQuizSettings from '@/components/quiz/EnhancedQuizSettings';
import { storage } from '@/lib/data/storage';
import { QuizStorage } from '@/lib/data/quiz-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Save, Trash2, Edit3, Eye } from 'lucide-react';

export default function EnhancedCreateQuizPage() {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz>({
    id: '',
    title: '',
    description: '',
    instructions: '',
    courseId: '',
    instructorId: '',
    questions: [],
    settings: defaultQuizSettings,
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      totalPoints: 0,
      questionCount: 0,
      published: false,
      version: 1
    },
    categories: [],
    tags: []
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType>('multiple-choice');

  useEffect(() => {
    const user = storage.getCurrentUser();
    if (user) {
      setQuiz(prev => ({ ...prev, instructorId: user.id }));
    }
  }, []);

  const handleSave = () => {
    const finalQuiz = {
      ...quiz,
      isPublished: quiz.metadata.published,
      metadata: {
        ...quiz.metadata,
        totalPoints: calculateTotalPoints(quiz.questions),
        questionCount: quiz.questions.length,
        updatedAt: new Date()
      }
    };
    
    QuizStorage.saveQuiz(finalQuiz);
    router.push('/instructor');
  };

  const handleAddQuestion = () => {
    const newQuestion: QuizQuestion = {
      ...createEmptyQuestion(selectedQuestionType),
      id: generateQuestionId(),
      order: quiz.questions.length
    };
    
    setQuiz({
      ...quiz,
      questions: [...quiz.questions, newQuestion]
    });
  };

  const handleSaveQuestion = (updatedQuestion: QuizQuestion) => {
    const updatedQuestions = quiz.questions.map((q) => 
      q.id === updatedQuestion.id ? updatedQuestion : q
    );
    
    setQuiz({
      ...quiz,
      questions: updatedQuestions
    });
    
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (questionId: string) => {
    const updatedQuestions = quiz.questions.filter((q) => q.id !== questionId);
    setQuiz({
      ...quiz,
      questions: updatedQuestions
    });
  };

  const getQuestionIcon = (type: QuestionType) => {
    const icons = {
      'multiple-choice': '🎯',
      'short-answer': '✏️',
      'true-false': '✓',
      'matching': '🔗',
      'fill-blank': '▢',
      'essay': '📝',
      'ranking': '📊',
      'matrix': '🧮',
      'file-upload': '📁',
      'code-editor': '💻',
      'drag-drop': '🎯'
    };
    return icons[type] || '❓';
  };

  if (editingQuestion) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Question</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Question Type</label>
                <Badge>{editingQuestion.type}</Badge>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Question Text</label>
                <Textarea
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Points</label>
                <Input
                  type="number"
                  value={editingQuestion.points}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, points: parseInt(e.target.value) || 1 })}
                  min="1"
                />
              </div>

              {editingQuestion.type === 'multiple-choice' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Options</label>
                  {editingQuestion.options?.map((option, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(editingQuestion.options || [])];
                          newOptions[index] = e.target.value;
                          setEditingQuestion({ ...editingQuestion, options: newOptions });
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Correct Answer</label>
                <Input
                  value={String(editingQuestion.correctAnswer)}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleSaveQuestion(editingQuestion)}>
                  Save Question
                </Button>
                <Button variant="outline" onClick={() => setEditingQuestion(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Create Comprehensive Quiz</h1>
          <p className="text-gray-600">Build interactive quizzes with 11+ question types</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quiz Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Quiz Title</label>
                      <Input
                        value={quiz.title}
                        onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                        placeholder="Enter quiz title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea
                        value={quiz.description}
                        onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                        placeholder="Describe your quiz"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Instructions</label>
                      <Textarea
                        value={quiz.instructions || ''}
                        onChange={(e) => setQuiz({ ...quiz, instructions: e.target.value })}
                        placeholder="Special instructions for students"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="questions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Questions ({quiz.questions.length})</CardTitle>
                    <p className="text-sm text-gray-600">Total Points: {calculateTotalPoints(quiz.questions)}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <EnhancedQuestionTypeSelector
                        selectedType={selectedQuestionType}
                        onTypeChange={setSelectedQuestionType}
                      />
                      <Button onClick={handleAddQuestion} className="mt-4">
                        <Plus className="h-4 w-4 mr-2" /> Add Question
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {quiz.questions.map((question, index) => (
                        <Card key={question.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{getQuestionIcon(question.type)}</span>
                              <div>
                                <p className="font-medium">{question.question.substring(0, 50)}...</p>
                                <p className="text-sm text-gray-600">
                                  {question.type} • {question.points} points
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingQuestion(question)}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteQuestion(question.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <EnhancedQuizSettings
                  settings={quiz.settings}
                  onSettingsChange={(newSettings) => setQuiz({ ...quiz, settings: newSettings })}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Questions:</span>
                  <Badge>{quiz.questions.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Total Points:</span>
                  <Badge>{calculateTotalPoints(quiz.questions)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Time Limit:</span>
                  <Badge>{quiz.settings.timeLimit} min</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Passing Score:</span>
                  <Badge>{quiz.settings.passingScore}%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={handleSave} className="w-full">
                  <Save className="h-4 w-4 mr-2" /> Save Quiz
                </Button>
                <Button variant="outline" onClick={() => router.push('/instructor')} className="w-full">
                  Cancel
                </Button>
              </Card
