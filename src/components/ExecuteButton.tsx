import type { ExecutionState } from '../types';

interface ExecuteButtonProps {
  state: ExecutionState;
  onClick: () => void;
  disabled?: boolean;
}

export function ExecuteButton({ state, onClick, disabled = false }: ExecuteButtonProps) {
  const isLoading = state === 'connecting' || state === 'sending' || state === 'triggering';
  const isSuccess = state === 'success';
  const isError = state === 'error';

  const getButtonText = () => {
    switch (state) {
      case 'connecting':
        return 'Connecting...';
      case 'sending':
        return 'Sending Payload...';
      case 'triggering':
        return 'Triggering Exploit...';
      case 'success':
        return 'Success!';
      case 'error':
        return 'Failed - Try Again';
      default:
        return 'Launch Payload';
    }
  };

  const getButtonClass = () => {
    if (isSuccess) return 'btn-success';
    if (isError) return 'btn-error';
    return 'btn-primary';
  };

  return (
    <button
      type="button"
      className={`btn btn-lg w-full ${getButtonClass()}`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading && (
        <span className='loading loading-spinner loading-sm'></span>
      )}
      {getButtonText()}
    </button>
  );
}
