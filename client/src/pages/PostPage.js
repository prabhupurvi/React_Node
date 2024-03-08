import { useContext, useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { formatISO9075 } from "date-fns"
import { UserContext } from "../UserContext"

export default function PostPage(){
    const [postInfo,setPostInfo] = useState(null)
    const [comment,setComment] = useState("")
    const {userInfo} = useContext(UserContext)
    const {id} = useParams()
    useEffect(() =>{
        fetch(`http://localhost:4000/post/${id}`)
        .then((response) =>{
            response?.json().then(postInfo=>{
                setPostInfo(postInfo)
            })
        })
    })

    async function addComment(e){ 
      e.preventDefault() ;
      if(comment !== ""){
      const data = new FormData();
      data.set('comment',comment);
      data.set('id',id)
      data.set('username',userInfo.username)
      const response = await fetch("http://localhost:4000/comment",{
            method:"POST",
            body: JSON.stringify({id,username:userInfo.username,comment}),
            headers:{"Content-Type":'application/json'},
            credentials:'include'
        })
        setComment("")
      }
    }

    if (!postInfo) return ''
    return (
      <div className="post-page">
        <h1>{postInfo.title}</h1>
        <time>{formatISO9075(new Date(postInfo.createdAt))}</time>
        <div className="author">by @{postInfo.author.username}</div>
        {userInfo?.id === postInfo.author._id && (
        <div className="edit-row">
          <Link to={`/edit/${postInfo._id}`} className="edit-btn" href="">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
            Edit this post
          </Link>
        </div>
        )}
        <div className="image">
          <img src={`http://localhost:4000/${postInfo.cover}`} alt="cover" />
        </div>
        <div
          className="content"
          dangerouslySetInnerHTML={{ __html: postInfo.content }}
        />
        {userInfo?.username && 
        <form onSubmit={addComment}>
          <div className="commentContainer">
              <p>Add Comment: </p>
            <div className="comment">
              <textarea cols={100} rows={2} onChange={e=>setComment(e.target.value)} value={comment}></textarea>
              <button>Post</button>
            </div>
          </div>
        </form>}
        <p style={{color:"red",fontWeight:"bold", display:"inline"}}>Comments: </p>
        {postInfo.comments.length > 0 ? 
        
        postInfo?.comments?.map((item)=>{
          return (<div className="addedComments">
           <span style={{fontWeight:"bold"}}> {item.username}</span>  : <div>{item.comment}</div>
          </div>)
        }):<p style={{display:"inline"}}>No comments </p>}
        
      </div>
    );
}