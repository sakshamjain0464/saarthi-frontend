import React, { useState } from 'react'
import MDEditor from '@uiw/react-md-editor'
import { Button } from './button'

export default function Editor ({
  iterinary,
  setEditorOpen,
  setIterinary,
  saveEditedIterinary
}) {
  const [text, setText] = useState(iterinary)

  return (
    <div className='w-screen h-screen fixed top-0 left-0 backdrop-blur-lg bg-white/30 border border-white/20 shadow-lg p-6 flex flex-col gap-5'>
      <MDEditor
        value={text}
        onChange={setText}
        preview='live'
        className='w-full min-h-[90%]'
      />
      <div className='flex justify-center'>
        <Button
          onClick={() => setEditorOpen(false)}
          variant='outline'
          className='w-fit mx-auto'
        >
          Close Editor
        </Button>
        <Button
          onClick={() => {
            saveEditedIterinary(text, setIterinary)
          }}
          variant='outline'
          className='w-fit mx-auto'
        >
          Save Iterninary
        </Button>
      </div>
    </div>
  )
}
