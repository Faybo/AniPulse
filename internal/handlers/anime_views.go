package handlers

import (
	"seanime/internal/database/models"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

// HandleGetAnimeViews
//
//	@summary gets view count for a specific anime
//	@desc Returns the number of views for the given anime media ID
//	@returns int
//	@param id - int - true - "AniList anime media ID"
//	@route /api/v1/anime/views/{id} [GET]
func (h *Handler) HandleGetAnimeViews(c echo.Context) error {
	mediaId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return h.RespondWithError(c, err)
	}

	var views models.AnimeViews
	err = h.App.Database.Gorm().Where("media_id = ?", mediaId).First(&views).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Return 0 if no views recorded yet
			return h.RespondWithData(c, 0)
		}
		return h.RespondWithError(c, err)
	}

	return h.RespondWithData(c, views.Views)
}

// HandleIncrementAnimeViews
//
//	@summary increments view count for an anime
//	@desc Increments the view count for the given anime media ID by 1
//	@returns int
//	@param mediaId - int - true - "AniList anime media ID"
//	@route /api/v1/anime/views/increment [POST]
func (h *Handler) HandleIncrementAnimeViews(c echo.Context) error {
	var request struct {
		MediaId int `json:"mediaId"`
	}

	if err := c.Bind(&request); err != nil {
		return h.RespondWithError(c, err)
	}

	if request.MediaId <= 0 {
		return h.RespondWithError(c, echo.NewHTTPError(400, "Invalid media ID"))
	}

	var views models.AnimeViews
	err := h.App.Database.Gorm().Where("media_id = ?", request.MediaId).First(&views).Error

	now := time.Now()

	if err == gorm.ErrRecordNotFound {
		// Create new record
		views = models.AnimeViews{
			MediaId:      request.MediaId,
			Views:        1,
			LastViewedAt: &now,
		}
		err = h.App.Database.Gorm().Create(&views).Error
	} else if err == nil {
		// Increment existing record
		views.Views++
		views.LastViewedAt = &now
		err = h.App.Database.Gorm().Save(&views).Error
	}

	if err != nil {
		return h.RespondWithError(c, err)
	}

	return h.RespondWithData(c, views.Views)
}

// HandleGetTopAnimeViews
//
//	@summary gets top anime by view count
//	@desc Returns the top anime sorted by view count
//	@returns []models.AnimeViews
//	@param limit - int - false - "Number of results to return (default: 10)"
//	@route /api/v1/anime/views/top [GET]
func (h *Handler) HandleGetTopAnimeViews(c echo.Context) error {
	limitStr := c.QueryParam("limit")
	limit := 10

	if limitStr != "" {
		var err error
		limit, err = strconv.Atoi(limitStr)
		if err != nil || limit <= 0 {
			limit = 10
		}
	}

	var views []models.AnimeViews
	err := h.App.Database.Gorm().Order("views DESC").Limit(limit).Find(&views).Error
	if err != nil {
		return h.RespondWithError(c, err)
	}

	return h.RespondWithData(c, views)
}

// HandleResetAnimeViews
//
//	@summary resets all anime views to zero
//	@desc Resets all view counts in the database to zero (for testing/cleanup)
//	@returns string
//	@route /api/v1/anime/views/reset [POST]
func (h *Handler) HandleResetAnimeViews(c echo.Context) error {
	err := h.App.Database.Gorm().Exec("DELETE FROM anime_views").Error
	if err != nil {
		return h.RespondWithError(c, err)
	}

	return h.RespondWithData(c, "All anime views have been reset to zero")
}

// HandleGetAnimeViewsByTimeFilter
//
//	@summary gets top anime by view count with time filter
//	@desc Returns the top anime sorted by view count within a specific time period
//	@returns []models.AnimeViews
//	@param filter - string - true - "Time filter: daily, weekly, monthly"
//	@param limit - int - false - "Number of results to return (default: 10)"
//	@route /api/v1/anime/views/top/{filter} [GET]
func (h *Handler) HandleGetAnimeViewsByTimeFilter(c echo.Context) error {
	filter := c.Param("filter")
	limitStr := c.QueryParam("limit")

	limit := 10
	if limitStr != "" {
		var err error
		limit, err = strconv.Atoi(limitStr)
		if err != nil || limit <= 0 {
			limit = 10
		}
	}

	var cutoffTime time.Time
	now := time.Now()

	switch filter {
	case "daily":
		cutoffTime = now.AddDate(0, 0, -1)
	case "weekly":
		cutoffTime = now.AddDate(0, 0, -7)
	case "monthly":
		cutoffTime = now.AddDate(0, -1, 0)
	default:
		return h.RespondWithError(c, echo.NewHTTPError(400, "Invalid filter. Use: daily, weekly, monthly"))
	}

	var views []models.AnimeViews
	err := h.App.Database.Gorm().
		Where("last_viewed_at >= ?", cutoffTime).
		Order("views DESC").
		Limit(limit).
		Find(&views).Error

	if err != nil {
		return h.RespondWithError(c, err)
	}

	return h.RespondWithData(c, views)
}
