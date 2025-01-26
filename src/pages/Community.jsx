import React, { useState } from 'react'

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
      "title": data.title,
      "name": "tester",
      "content": data.content,
      "time": new Date(),
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

// mock posts
const posts = [
  {
    title: "kary's first post",
    name: "kary",
    content: "my first post",
    time: new Date(),
    comments: [
      {
        name: "clarie",
        comment: "hello",
        time: new Date()
      },
    ],
  },
  {
    title: "clarie's first post",
    name: "clarie",
    content: "my first post",
    time: new Date(),
    comments: [
      {
        name: "kary",
        comment: "hello",
        time: new Date()
      },
      {
        name: "clarie",
        comment: "my post is the best",
        time: new Date()
      },
    ],
  },
  {
    title: "ansh's first post",
    name: "ansh",
    content: "my first post",
    time: new Date(),
    comments: [
      {
        name: "clarie",
        comment: "hello",
        time: new Date()
      },
    ],
  },
  {
    title: "ivan's first post",
    name: "ivan",
    content: "my first post",
    time: new Date(),
    comments: [],
  },
]

function PostList({ postList }) {
  return (
    <div className="">
      {postList.map((post, i) => (
        <Post key={`Post${i}`} post={post} />
      ))}
    </div>
  )
}

function Post({ className, post, props }) {
  return (
    <div className={`text-left text-base rounded-xl border border-gray-300 m-4 px-4 pt-4 pb-2 ${className}`} {...props}>
      <div className="flex justify-between">
        <p className="text-4xl font-bold">{post.title}</p>
        <p className="font-bold">{post.name}</p>
      </div>
      <p className="text-lg my-2">{post.content}</p>
      <time dateTime={post.time} className="text-xs">{`${post.time.toLocaleString()}`}</time>
      <div className="pt-4">
        <p className="pb-2">Comments</p>
        {post.comments.map((comment, i) => (
          <>
            <div key={`commemt${i}`} className="flex justify-between">
              <p key={`commemt${i}${comment.name}`} className="text-sm font-bold">{comment.name}</p>
              <time key={`commemt${i}${comment.time.toLocaleString()}`} dateTime={comment.time} className="text-xs">{comment.time.toLocaleString()}</time>
            </div>
            <p key={`commemt${i}${comment.comment}`} className="pl-4 pb-2">{comment.comment}</p>
          </>
        ))}
      </div>
    </div>
  )
}

function Community() {
  const [isOpen, setOpen] = useState(false);
  const [postList, setPostList] = useState(posts);

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
