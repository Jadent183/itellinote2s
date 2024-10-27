import React from 'react';
import DataStructureVisualizer from '@/components/notes/DataStructureVisualizer';

const isHeader = (line) => {
  return line.endsWith(':');
};

const formatContent = (content = []) => {
    try {
      const sections = [];
      let currentSection = null;
  
      content.forEach((line) => {
        if (isHeader(line)) {
          if (currentSection) {
            sections.push(currentSection);
          }
          currentSection = {
            title: line.replace(':', ''),
            content: []
          };
        } else if (currentSection) {
          if (/^\d+\./.test(line)) {
            const [number, ...restOfLine] = line.split('. ');
            const stepContent = restOfLine.join('. ');
  
            if (stepContent.includes(':')) {
              const [title, description] = stepContent.split(': ');
              currentSection.content.push({
                type: 'numbered',
                number: number,
                title: title,
                description: description
              });
            } else {
              currentSection.content.push({
                type: 'numbered',
                number: number,
                content: stepContent
              });
            }
          } else {
            currentSection.content.push({
              type: 'bullet',
              content: line
            });
          }
        }
      });
  
      if (currentSection) {
        sections.push(currentSection);
      }
  
      return sections;
    } catch (error) {
        console.error('Error in formatContent:', error);
        throw error;
    }
  };
  
  
// Helper function to normalize data structure format
const normalizeDataStructures = (dataStructures) => {
    if (!dataStructures) return [];
    if (dataStructures === 'none') return [];
    if (typeof dataStructures === 'string') {
      return [{
        type: dataStructures,
        initialValues: []
      }];
    }
    if (Array.isArray(dataStructures)) {
      return dataStructures.map(ds => {
        if (typeof ds === 'string') {
          return {
            type: ds,
            initialValues: []
          };
        }
        return ds;
      });
    }
    return [dataStructures];
  };

  
  const formatValues = (values) => {
    if (!values || values.length === 0) return '';
    if (Array.isArray(values)) {
      return values.join(',');
    }
    return values.toString();
  };


const DynamicLectureNotes = ({ lectureData }) => {
  const { 
    content, 
    "data-structures": rawDataStructures,
    "initial-values": defaultInitialValues = [] 
  } = lectureData;

  const dataStructures = normalizeDataStructures(rawDataStructures).map(ds => ({
    ...ds,
    initialValues: ds.initialValues || defaultInitialValues
  }));

  const sections = formatContent(content);

  const renderDataStructureVisualizers = () => {
    if (dataStructures.length === 0) return null;

    return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {dataStructures.map((ds, index) => {
              // Format the initial values based on data structure type
              const formattedValues = formatValues(ds.initialValues);
              
              return (
                <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                  <h4 className="text-md font-semibold mb-4">
                    {ds.type.charAt(0).toUpperCase() + ds.type.slice(1)} Visualization
                  </h4>
                  <DataStructureVisualizer
                    type={ds.type}
                    defaultValues={formattedValues}
                    name={`${ds.type.charAt(0).toUpperCase() + ds.type.slice(1)} Structure`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* Title Section */}
          <div className="border-b pb-4">
            <h1 className="text-3xl font-bold text-blue-900">
              Lecture Notes on {lectureData.subject}
            </h1>
          </div>
    
          {/* Content Sections */}
          <div className="space-y-6 text-gray-700">
            {sections.map((section, index) => (
              <section key={index} className="space-y-4">
                <h2 className="text-xl font-bold text-blue-800">
                  {section.title}
                </h2>
    
                <div className={`
                  ${section.title === 'Summary' ? 'bg-gray-50 p-4 rounded-lg' : ''}
                `}>
                  {section.content.map((item, i) => {
                    if (item.type === 'numbered') {
                      return (
                        <div key={i} className="ml-6 mb-2">
                          <div className="flex gap-2">
                            <span className="font-semibold text-blue-700">{item.number}.</span>
                            <div>
                              {item.title ? (
                                <>
                                  <span className="font-semibold">{item.title}:</span>
                                  <span className="ml-1">{item.description}</span>
                                </>
                              ) : (
                                item.content
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={i} className="ml-6 mb-2">
                          <div className="flex items-start">
                            <span className="mr-2 text-blue-700">•</span>
                            <span>{item.content}</span>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
    
                {/* Add visualizations after Example section */}
                {section.title === 'Example' && dataStructures.length > 0 && renderDataStructureVisualizers()}
              </section>
            ))}
          </div>
        </div>
      );
    };
    
    export default DynamicLectureNotes;