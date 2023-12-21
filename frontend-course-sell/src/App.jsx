import { useState } from 'react'
import './App.css'

function App() {
  const [todo,setTodo] = useState({
    title : "abc",
    description : "kaam h",
    id : 1
  })

  setInterval(() => {
    setTodo({
      title : "1234",
      description : "kaam nhi h ab",
      id : 1
    })
  }, 1000);

  function Personname(props){
    return <div>
      {props.firstName}
      <br></br>
      {props.lastName}
    </div>
  }
  return (
    <>
      <h2>Hello World!</h2>
      {todo.title}
      {todo.description}
      {todo.id}
      <Personname firstName = "Pankaj" lastName = "Suthar">
      </Personname>
    </>
  )
}

export default App
