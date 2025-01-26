import React, { useState, useEffect } from 'react'
import axios from 'axios';

function SearchField() {
  return (
    <input type="text" placeholder="Search posts..." className="border rounded-md p-2 focus:outline-none border-brand-red" />
  )
}

function Form({ setPostList }) {
  const [data, setData] = useState({
    "title": "",
    "content": "",
  });

  function handleChange(e) {
    setData({ ...data, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault();

    setPostList(prvList => [...prvList, {
      "username": "tester",
      "content": data.content,
      "timestamp": new Date(),
      "comments": []
    }]);
  }

  return (
    <form
      // action=""
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-4"
    >
      <input
        type="text"
        name="title"
        placeholder="Title"
        value={data.title}
        onChange={handleChange}
        className="border rounded-md w-1/3 p-2"
      />
      <textarea
        name="content"
        placeholder="Write your message here..."
        value={data.content}
        onChange={handleChange}
        className="border rounded-md w-1/3 h-36 p-2"
      />
      <button
        type="submit"
        className="border rounded-md p-2 border-brand-red text-gray-600 bg-gray-100"
      >
        Submit
      </button>
    </form>
  )
}

// // mock posts
// const posts = [
//   {
//     title: "kary's first post",
//     name: "kary",
//     content: "my first post",
//     time: new Date(),
//     comments: [
//       {
//         name: "clarie",
//         comment: "hello",
//         time: new Date()
//       },
//     ],
//   },
//   {
//     title: "clarie's first post",
//     name: "clarie",
//     content: "my first post",
//     time: new Date(),
//     comments: [
//       {
//         name: "kary",
//         comment: "hello",
//         time: new Date()
//       },
//       {
//         name: "clarie",
//         comment: "my post is the best",
//         time: new Date()
//       },
//     ],
//   },
//   {
//     title: "ansh's first post",
//     name: "ansh",
//     content: "my first post",
//     time: new Date(),
//     comments: [
//       {
//         name: "clarie",
//         comment: "hello",
//         time: new Date()
//       },
//     ],
//   },
//   {
//     title: "ivan's first post",
//     name: "ivan",
//     content: "my first post",
//     time: new Date(),
//     comments: [],
//   },
// ]

function PostList({ postList }) {
  return (
    <div className="">
      {postList.map((post) => (
        <Post key={`${post._id}`} post={post} />
      ))}
    </div>
  )
}

function Post({ className, post, props }) {
  // console.log(post._id);
  // console.log("comments[0]", post.comments[0]);
  // console.log(post.content);
  // console.log(post.timestamp);
  // console.log(post.username);
  console.log(post.image_url);
  return (
    <div className={`text-left text-base rounded-xl border border-gray-300 m-4 px-4 pt-4 pb-2 ${className}`} {...props}>
      <div className="flex justify-between">
        <p className="font-bold">{post.username}</p>
      </div>
      {post.image_url && <img src={post.image_url} />}
      <p className="text-lg my-2">{post.content}</p>
      <time dateTime={new Date(post.timestamp).toLocaleTimeString()} className="text-xs">{`${new Date(post.timestamp).toLocaleTimeString()}`}</time>
      <div className="pt-4">
        {post.comments.map((comment) => (
          <>
            <div key={`${comment._id}`} className="flex justify-between">
              <p key={`${comment._id}${comment.username}`} className="text-sm font-bold">{comment.username}</p>
              <time key={`${comment._id}${new Date(comment.timestamp).toLocaleTimeString()}`} dateTime={comment.time} className="text-xs">{new Date(comment.timestamp).toLocaleTimeString()}</time>
            </div>
            <p key={`${comment._id}${comment.content}`} className="pl-4 pb-2">{comment.content}</p>
          </>
        ))}
      </div>
    </div>
  )
}

function Community() {
  const [isOpen, setOpen] = useState(false);
  const [postList, setPostList] = useState([]);
  const dbUrl = "http://localhost:5000"

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const resp = await axios.get(dbUrl);
        setPostList(resp.data);
      } catch (err) {
        console.log(err);
      }
    }
    fetchPosts()
  }, []);

  function AddButton({ children }) {
    return (
      <button
        onClick={() => setOpen(prvState => !prvState)}
        className="border rounded-md p-2 border-brand-red text-gray-600 bg-gray-100"
      >
        {children}
      </button>
    )
  }

  return (
    <div className="rounded-3xl flex-1 max-h-full bg-cover bg-center max-w-full">
      <div className="flex justify-evenly pt-2 pb-4">
        <SearchField />
        <AddButton>{isOpen ? "Cancel" : "Add a post"}</AddButton>
      </div>
      {isOpen && <Form setPostList={setPostList} />}
      <PostList postList={postList} />
    </div>
  )
}

export default Community
