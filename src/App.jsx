import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
import { onSnapshot, addDoc, doc, deleteDoc, setDoc } from "firebase/firestore"
import { notesCollection, db } from "./firebase"

export default function App() {

  const [notes, setNotes] = React.useState([])
  const [currentNoteId, setCurrentNoteId] = React.useState("")
  const [tempNoteText, setTempNoteText] = React.useState("")

  const currentNote =
    notes.find(note => note.id === currentNoteId)
    || notes[0]

  //create sorted notes array from most recent to oldest
  const sortedNotes = notes.sort((a, b) => b.updatedAt - a.updatedAt)

  React.useEffect(() => {
    //sets up websocket connection, needs a way to unmount this listener
    const unsubscribe = onSnapshot(notesCollection, (snapshot) => {
      //sync up local notes array with the snapshot data
      //for every document in the snapshot, map it to an object with the id and data
      const notesArray = snapshot.docs.map(doc => {
        return {
          id: doc.id,
          ...doc.data()
        }
      })
      setNotes(notesArray)
    })
    return unsubscribe
  }, [])

  React.useEffect(() => {
    if (!currentNoteId) {
      setCurrentNoteId(notes[0]?.id)
    }
  }, [notes])

  React.useEffect(() => {

    //update tempnotetext anytime the current note changes
    if (currentNote) {
      setTempNoteText(currentNote.body)
    }

  }, [currentNote])

  React.useEffect(() => {
    //run when temp note text changes. delay sending request to firestore
    //debounce the update note function
    const timer = setTimeout(() => {
      if (tempNoteText !== currentNote.body) {
        updateNote(tempNoteText)
      }

    }, 500)

    //cancelling old timer timeout
    return () => clearTimeout(timer)

  }, [tempNoteText])

  async function createNewNote() {
    const newNote = {
      createdAt: Date.now(),
      updatedAt: Date.now(),
      body: "# Type your markdown note's title here"
    }
    const newNoteRef = await addDoc(notesCollection, newNote)
    setCurrentNoteId(newNoteRef.id)
  }

  async function updateNote(text) {
    const docRef = doc(db, "notes", currentNoteId)
    //merge will not allow overwriting the entire document
    await setDoc(
      docRef,
      { body: text, updatedAt: Date.now() },
      { merge: true })
  }

  async function deleteNote(noteId) {
    const docRef = doc(db, "notes", noteId)
    await deleteDoc(docRef)
  }

  return (
    <main>
      {
        notes.length > 0
          ?
          <Split
            sizes={[30, 70]}
            direction="horizontal"
            className="split"
          >
            <Sidebar
              notes={sortedNotes}
              currentNote={currentNote}
              setCurrentNoteId={setCurrentNoteId}
              newNote={createNewNote}
              deleteNote={deleteNote}
            />
            <Editor
              tempNoteText={tempNoteText}
              setTempNoteText={setTempNoteText}
            />
          </Split>
          :
          <div className="no-notes">
            <h1>You have no notes</h1>
            <button
              className="first-note"
              onClick={createNewNote}
            >
              Create one now
            </button>
          </div>

      }
    </main>
  )
}
