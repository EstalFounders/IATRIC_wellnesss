import { dbConnect } from '../../../src/lib/db';
import ArticlePost from '../../../src/models/postArticleSchema';


export default async function handler(req, res){
    await dbConnect();
    if (req.method === 'GET') {
        try {
            const posts = await ArticlePost.find();
            console.log(posts, 'posts on server')
            res.status(200).json(posts);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch posts' });
        }
    } else if (req.method === 'POST') {
        try {
            console.log(req.body, 'req.body on server')
            const newPost = new ArticlePost(req.body);
            await newPost.save();
            res.status(201).json(newPost);
        } catch (error) {
            console.log(error, 'error')
            res.status(500).json({ error: 'Failed to create post' });
        }
    } else if (req.method === 'PUT') {
        const { id } = req.query;
        console.log(id, 'id on server')
        try {
            const updatedNewPost = await ArticlePost.findByIdAndUpdate(id, req.body, { new: true });
            res.status(200).json(updatedNewPost);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update post' });
        }
    } 
    else if (req.method === 'DELETE') {
        const { id } = req.query;
        try {
            await ArticlePost.findByIdAndDelete(id);
            res.status(200).json({ message: 'Lab deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete post' });
        }
    } else {
        res.status(405).end();
    }
};
