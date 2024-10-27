

const useTypewriter = (text, speed = 50, delay = 0) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) return; // Guard against undefined/null text
    
    setIsTyping(true);
    let currentIndex = 0;
    setDisplayText('');

    const timer = setTimeout(() => {
      const intervalId = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText((prev) => prev + text[currentIndex]);
          currentIndex++;
        } else {
          clearInterval(intervalId);
          setIsTyping(false);
        }
      }, speed);

      return () => clearInterval(intervalId);
    }, delay);

    return () => clearTimeout(timer);
  }, [text, speed, delay]);

  return { displayText: displayText || '', isTyping };
};

export default useTypewriter;