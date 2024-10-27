import SpeechTranscription from '@/components/custom/SpeechTranscription';
import DataStructureVisualizer from '@/components/custom/DataStructureVisualizer';

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <SpeechTranscription />
    
      <DataStructureVisualizer
        type="bst"
        defaultValues="11,4,8,1,9"  // Values will be automatically sorted
        name="Binary Search Tree"
      />
    </main>
  );
}