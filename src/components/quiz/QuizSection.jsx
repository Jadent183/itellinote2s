import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const QuizSection = ({ quizzes = [] }) => {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswer = (index, selectedAnswer) => {
    if (!showResults) {
      setAnswers(prev => ({
        ...prev,
        [index]: selectedAnswer
      }));
    }
  };

  const checkAnswers = () => {
    let correctCount = 0;
    quizzes.forEach((quiz, index) => {
      if (answers[index] === quiz['real-answer']) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const getButtonStyle = (index, answer) => {
    if (!showResults) {
      return answers[index] === answer ? 'bg-blue-100' : '';
    }
    
    const isCorrect = answer === quizzes[index]['real-answer'];
    const wasSelected = answers[index] === answer;

    if (isCorrect) {
      return 'bg-green-100 hover:bg-green-100';
    }
    if (wasSelected && !isCorrect) {
      return 'bg-red-100 hover:bg-red-100';
    }
    return 'opacity-50';
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Quiz Time!</span>
          {showResults && (
            <span className="text-lg">
              Score: {score}/{quizzes.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {quizzes.map((quiz, index) => (
          <div key={index} className="space-y-4">
            <h3 className="text-lg font-medium">{quiz.question}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[quiz['real-answer'], quiz['false-answer']].sort().map((answer) => (
                <Button
                  key={answer}
                  variant="outline"
                  className={`relative h-auto py-4 px-6 justify-start text-left ${getButtonStyle(index, answer)}`}
                  onClick={() => handleAnswer(index, answer)}
                  disabled={showResults}
                >
                  <span>{answer}</span>
                  {showResults && answer === answers[index] && (
                    <span className="absolute right-4">
                      {answer === quiz['real-answer'] ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </span>
                  )}
                </Button>
              ))}
            </div>
            {showResults && answers[index] !== quiz['real-answer'] && (
              <Alert>
                <AlertDescription>
                  The correct answer is: {quiz['real-answer']}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ))}

        <div className="pt-4 flex justify-end">
          {!showResults ? (
            <Button
              onClick={checkAnswers}
              disabled={Object.keys(answers).length !== quizzes.length}
            >
              Check Answers
            </Button>
          ) : (
            <Button onClick={resetQuiz}>Try Again</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizSection;