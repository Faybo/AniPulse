package handlers

import (
	"net"
	"net/http"
	"time"

	"seanime/internal/database/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Contact types for Gin handlers
type ContactRequestGin struct {
	Email   string `json:"email" binding:"required,email"`
	Subject string `json:"subject" binding:"required,min=1,max=200"`
	Message string `json:"message" binding:"required,min=1,max=2000"`
}

type ContactResponseGin struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type ContactMessageResponseGin struct {
	ID        uint      `json:"id"`
	Email     string    `json:"email"`
	Subject   string    `json:"subject"`
	Message   string    `json:"message"`
	IP        string    `json:"ip"`
	Read      bool      `json:"read"`
	CreatedAt time.Time `json:"createdAt"`
}

// HandleContactSubmit handles contact form submissions
func HandleContactSubmit(c *gin.Context) {
	var req ContactRequestGin
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ContactResponseGin{
			Success: false,
			Message: "Invalid request data",
		})
		return
	}

	// Get client IP - using Gin version
	clientIP := getClientIPGin(c)

	// Create contact message
	contactMsg := models.ContactMessage{
		Email:   req.Email,
		Subject: req.Subject,
		Message: req.Message,
		IP:      clientIP,
		Read:    false,
	}

	// Save to database
	db := c.MustGet("db").(*gorm.DB)
	if err := db.Create(&contactMsg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, ContactResponseGin{
			Success: false,
			Message: "Failed to save message",
		})
		return
	}

	c.JSON(http.StatusOK, ContactResponseGin{
		Success: true,
		Message: "Message sent successfully",
	})
}

// HandleGetContactMessages handles getting contact messages for admin
func HandleGetContactMessages(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)

	var messages []models.ContactMessage
	if err := db.Order("created_at DESC").Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages"})
		return
	}

	var response []ContactMessageResponseGin
	for _, msg := range messages {
		response = append(response, ContactMessageResponseGin{
			ID:        msg.ID,
			Email:     msg.Email,
			Subject:   msg.Subject,
			Message:   msg.Message,
			IP:        msg.IP,
			Read:      msg.Read,
			CreatedAt: msg.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{"messages": response})
}

// HandleMarkContactMessageRead handles marking a contact message as read
func HandleMarkContactMessageRead(c *gin.Context) {
	messageID := c.Param("id")

	db := c.MustGet("db").(*gorm.DB)

	if err := db.Model(&models.ContactMessage{}).Where("id = ?", messageID).Update("read", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark message as read"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// HandleDeleteContactMessage handles deleting a contact message
func HandleDeleteContactMessage(c *gin.Context) {
	messageID := c.Param("id")

	db := c.MustGet("db").(*gorm.DB)

	if err := db.Delete(&models.ContactMessage{}, messageID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete message"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// getClientIPGin extracts the real client IP from the Gin request
func getClientIPGin(c *gin.Context) string {
	// Check for forwarded headers first
	if ip := c.GetHeader("X-Forwarded-For"); ip != "" {
		return ip
	}
	if ip := c.GetHeader("X-Real-IP"); ip != "" {
		return ip
	}
	if ip := c.GetHeader("CF-Connecting-IP"); ip != "" {
		return ip
	}

	// Fallback to remote address
	ip, _, err := net.SplitHostPort(c.Request.RemoteAddr)
	if err != nil {
		return c.Request.RemoteAddr
	}
	return ip
}
