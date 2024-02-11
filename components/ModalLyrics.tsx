interface ModalProps {
    onClose: () => void;
    children: React.ReactNode
  }
  
  const ModalLyrics: React.FC<ModalProps> = ({ children, onClose }) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-75"></div>
        <div className="z-10 bg-white p-4 max-w-md mx-auto rounded-lg">
          <div className="flex justify-end">
            <button onClick={onClose}>&times;</button>
          </div>
          {children}
        </div>
      </div>
    );
  };
  