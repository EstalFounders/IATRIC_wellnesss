// ---------- ArticleManager: list + edit ----------

import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Badge,
} from "react-bootstrap";
import { deletePostArticle, fetchAllPost } from "../apiService/postArticleService";
import PostArticleComp from "./PostArticleComp";
import ArticleEditForm from "./ArticleEditForm";
import { BiEdit } from "react-icons/bi";
import { Delete } from "@mui/icons-material";

export const ArticleManager = () => {
  /** @type {[ArticleDetails[], Function]} */
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetchAllPost(setArticles);
  }, []);

  /** @type {[ArticleDetails|null, Function]} */
  const [editingArticle, setEditingArticle] = useState(null);

  const handleCreateOrUpdate = (article) => {
    setArticles((prev) => {
      const exists = prev.some((a) => a.id === article.id);
      if (exists) {
        // update existing
        return prev.map((a) => (a.id === article.id ? article : a));
      }
      // create new
      return [...prev, article];
    });
    setEditingArticle(null);
  };

  const handleEditClick = (article) => {
    setEditingArticle(article);
    // Scroll to top so the form is visible
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingArticle(null);
  };

  const handledleteClick = (article) => {      
    console.log("Deleting article with id:", article);
    const id = article._id
    deletePostArticle(id).then((success) => {
      if (success) {
        // Remove the deleted article from state
        setArticles((prev) => prev.filter((a) => a._id !== id));
      } else {
        // Handle deletion failure (e.g., show an error message)
        console.error("Failed to delete the article.");
      }
    });
  } 

  return (
    <div className="py-5">
      {/* Create / Edit Form */}
      {editingArticle && (
        <ArticleEditForm
          initialData={editingArticle}
          onUpdate={handleCreateOrUpdate}
        />
      )}

      {editingArticle && (
        <Container style={{ maxWidth: "700px" }} className="mb-4">
          <div className="d-flex justify-content-end">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleCancelEdit}
            >
              Cancel Edit
            </Button>
          </div>
        </Container>
      )}

      {/* List of Articles */}
      <Container style={{ maxWidth: "900px" }}>
        <h3 className="mb-3">Existing Articles</h3>
        {articles.length === 0 ? (
          <p className="text-muted">
            No articles added yet. Use the form above to add one.
          </p>
        ) : (
          <Row>
            {articles.map((article) => (
              <Col key={article.id} xs={12} md={6} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Badge
                        bg="success"
                        className="mb-2"
                        style={{ backgroundColor: "#dff8ef", color: "#008060" }}
                      >
                        {article.category}
                      </Badge>
                      <div
                        // variant="outline-primary"
                        onClick={() => handleEditClick(article)}
                      >
                        <BiEdit size={20} />
                      </div>
                      <div
                        // variant="outline-danger"
                        onClick={() => handledleteClick(article)}
                      >
                        <Delete size={20} /> 
                      </div>
                    </div>
                    <Card.Title>{article.title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      {article.date} • {article.readTime || "Read time N/A"}
                    </Card.Subtitle>
                    <Card.Text className="mb-1">
                      <small className="text-muted">By {article.author}</small>
                    </Card.Text>
                    <Card.Text
                      className="text-secondary"
                      style={{
                        maxHeight: "4.5rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {article.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};
