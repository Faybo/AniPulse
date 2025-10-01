package handlers

import (
	"net"
	"seanime/internal/database/models"
	"time"

	"github.com/labstack/echo/v4"
)

// Contact types
type ContactRequest struct {
	Email   string `json:"email" binding:"required,email"`
	Subject string `json:"subject" binding:"required,min=1,max=200"`
	Message string `json:"message" binding:"required,min=1,max=2000"`
}

type ContactResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type ContactMessageResponse struct {
	ID        uint      `json:"id"`
	Email     string    `json:"email"`
	Subject   string    `json:"subject"`
	Message   string    `json:"message"`
	IP        string    `json:"ip"`
	Read      bool      `json:"read"`
	CreatedAt time.Time `json:"createdAt"`
}

// Contact handlers
func (h *Handler) HandleContactSubmit(c echo.Context) error {
	var req ContactRequest
	if err := c.Bind(&req); err != nil {
		return h.RespondWithError(c, echo.NewHTTPError(400, "Invalid request data"))
	}

	// Get client IP
	clientIP := getClientIP(c)

	// Create contact message
	contactMsg := models.ContactMessage{
		Email:   req.Email,
		Subject: req.Subject,
		Message: req.Message,
		IP:      clientIP,
		Read:    false,
	}

	// Save to database
	if err := h.App.Database.Gorm().Create(&contactMsg).Error; err != nil {
		return h.RespondWithError(c, err)
	}

	return h.RespondWithData(c, ContactResponse{
		Success: true,
		Message: "Message sent successfully",
	})
}

func (h *Handler) HandleGetContactMessages(c echo.Context) error {
	var messages []models.ContactMessage
	if err := h.App.Database.Gorm().Order("created_at DESC").Find(&messages).Error; err != nil {
		return h.RespondWithError(c, err)
	}

	var response []ContactMessageResponse
	for _, msg := range messages {
		response = append(response, ContactMessageResponse{
			ID:        msg.ID,
			Email:     msg.Email,
			Subject:   msg.Subject,
			Message:   msg.Message,
			IP:        msg.IP,
			Read:      msg.Read,
			CreatedAt: msg.CreatedAt,
		})
	}

	return h.RespondWithData(c, map[string]interface{}{"messages": response})
}

func (h *Handler) HandleMarkContactMessageRead(c echo.Context) error {
	messageID := c.Param("id")

	if err := h.App.Database.Gorm().Model(&models.ContactMessage{}).Where("id = ?", messageID).Update("read", true).Error; err != nil {
		return h.RespondWithError(c, err)
	}

	return h.RespondWithData(c, map[string]interface{}{"success": true})
}

func (h *Handler) HandleDeleteContactMessage(c echo.Context) error {
	messageID := c.Param("id")

	if err := h.App.Database.Gorm().Delete(&models.ContactMessage{}, messageID).Error; err != nil {
		return h.RespondWithError(c, err)
	}

	return h.RespondWithData(c, map[string]interface{}{"success": true})
}

// getClientIP extracts the real client IP from the request
func getClientIP(c echo.Context) string {
	// Check for forwarded headers first
	if ip := c.Request().Header.Get("X-Forwarded-For"); ip != "" {
		return ip
	}
	if ip := c.Request().Header.Get("X-Real-IP"); ip != "" {
		return ip
	}
	if ip := c.Request().Header.Get("CF-Connecting-IP"); ip != "" {
		return ip
	}

	// Fallback to remote address
	ip, _, err := net.SplitHostPort(c.Request().RemoteAddr)
	if err != nil {
		return c.Request().RemoteAddr
	}
	return ip
}
