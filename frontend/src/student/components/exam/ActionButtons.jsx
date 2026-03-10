import React from 'react';

const ActionButtons = ({
    onClearResponse,
    onMarkForReview,
    onSaveAndNext,
    onFinish,
    isLastQuestion
}) => {
    return (
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
                onClick={onClearResponse}
                className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-200 focus:outline-none"
            >
                Clear Response
            </button>

            <div className="flex gap-3">
                <button
                    onClick={onMarkForReview}
                    className="px-6 py-2.5 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 shadow-sm transition-colors focus:ring-2 focus:ring-yellow-300 focus:outline-none"
                >
                    Mark for Review & Next
                </button>

                {!isLastQuestion && (
                    <button
                        onClick={onSaveAndNext}
                        className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow-sm transition-colors focus:ring-2 focus:ring-green-400 focus:outline-none"
                    >
                        Save & Next
                    </button>
                )}

                <button
                    onClick={onFinish}
                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                    Finish Test
                </button>
            </div>
        </div>
    );
};

export default ActionButtons;
