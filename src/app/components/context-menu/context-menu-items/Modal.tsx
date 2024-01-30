import {
  ChangeEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  MutableRefObject,
} from 'react'

const Modal = ({
  folderName,
  handleCancel,
  handleKeyPress,
  handleOk,
  onChange,
  popupRef,
}: {
  folderName: string
  handleCancel: MouseEventHandler<HTMLButtonElement>
  handleKeyPress?: KeyboardEventHandler<HTMLInputElement>
  handleOk?: MouseEventHandler<HTMLButtonElement>
  onChange?: ChangeEventHandler<HTMLInputElement>
  popupRef: MutableRefObject<null>
}) => (
  <div
    className="absolute left-full top-[-5px] z-10 ml-2 origin-left-center animate-emerge-from-lamp rounded-lg border border-gray-300 bg-white p-1 shadow-lg "
    ref={popupRef}
  >
    <div className="flex flex-col space-y-1">
      <input
        autoFocus
        className="rounded px-3 py-1 shadow outline outline-gray-200 focus:outline-gray-300"
        onChange={onChange}
        onKeyDown={handleKeyPress}
        placeholder="Enter folder name"
        value={folderName}
      />
      <div className="flex justify-end space-x-2">
        <button
          className={`${
            folderName.length === 0
              ? 'bg-gray-200 hover:bg-gray-200'
              : 'hover:bg-blue-700'
          } flex-1 rounded bg-blue-500 px-3 py-1 text-white`}
          disabled={folderName.length === 0}
          onClick={handleOk}
        >
          Add
        </button>
        <button
          className="flex-1 rounded bg-red-500 px-3 py-1 text-white hover:bg-red-700"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)

export default Modal
