import { dbConnect } from '../../../src/lib/db';
import ArticlePost from '../../../src/models/postArticleSchema';
import { logErrorToGoogleSheet } from '../helper';


export default async function handler(req, res){
    await dbConnect();
    if (req.method === 'GET') {
        try {
            const posts = await ArticlePost.find();
            console.log(posts, 'posts on server')
            res.status(200).json(posts);
        } catch (error) {
            await logErrorToGoogleSheet({
              apiName: "postArticle - GET",
              errorMessage: error.message || "Failed to fetch posts",
              errorCode: "500",
              stackTrace: error.stack,
            });
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
            await logErrorToGoogleSheet({
              apiName: "postArticle - POST",
              errorMessage: error.message || "Failed to create post",
              errorCode: "500",
              stackTrace: error.stack,
              requestPayload: req.body,
            });
            res.status(500).json({ error: 'Failed to create post' });
        }
    } else if (req.method === 'PUT') {
        const { id } = req.query;
        console.log(id, 'id on server')
        try {
            const updatedNewPost = await ArticlePost.findByIdAndUpdate(id, req.body, { new: true });
            res.status(200).json(updatedNewPost);
        } catch (error) {
            await logErrorToGoogleSheet({
              apiName: "postArticle - PUT",
              errorMessage: error.message || "Failed to update post",
              errorCode: "500",
              stackTrace: error.stack,
              requestPayload: { id, ...req.body },
            });
            res.status(500).json({ error: 'Failed to update post' });
        }
    } 
    else if (req.method === 'DELETE') {
        const { id } = req.query;
        try {
            await ArticlePost.findByIdAndDelete(id);
            res.status(200).json({ message: 'Lab deleted successfully' });
        } catch (error) {
            await logErrorToGoogleSheet({
              apiName: "postArticle - DELETE",
              errorMessage: error.message || "Failed to delete post",
              errorCode: "500",
              stackTrace: error.stack,
              requestPayload: { id },
            });
            res.status(500).json({ error: 'Failed to delete post' });
        }
    } else {
        res.status(405).end();
    }
};