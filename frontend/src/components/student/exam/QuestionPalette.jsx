import React from 'react';

const QuestionPalette = ({ sections, currentSectionIndex, currentQuestionIndex, onNavigate, getQuestionButtonClass }) => {
    return (
        <div className="p-4">
            {sections.map((section, sIdx) => (
                <div key={sIdx} className="mb-6">
                    <h3 className="text-xs font-bold text-gray-700 uppercase mb-3 tracking-wide">
                        {section.title}
                    </h3>
                    <div className="grid grid-cols-5 gap-2">
                        {section.questions.map((q, qIdx) => (
                            <button
                                key={qIdx}
                                onClick={() => onNavigate(sIdx, qIdx)}
                                className={`w-full aspect-square rounded font-semibold text-sm transition-all transform ${getQuestionButtonClass(
                                    sIdx,
                                    qIdx,
                                    currentSectionIndex,
                                    currentQuestionIndex
                                )}`}
                            >
                                {qIdx + 1}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default QuestionPalette;
