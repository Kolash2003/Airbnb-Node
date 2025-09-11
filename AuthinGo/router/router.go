package router

import (
	"AuthinGo/controllers"
	"AuthinGo/middlewares"

	chi "github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type Router interface {
	Register(r chi.Router)
}

func SetupRouter(UserRouter Router) *chi.Mux {
	chiRouter := chi.NewRouter()

	chiRouter.Use(middleware.Logger)

	chiRouter.Use(middlewares.RequestValidator)

	chiRouter.Get("/ping", controllers.PingHandler)
	
	UserRouter.Register(chiRouter)


	return chiRouter
}
