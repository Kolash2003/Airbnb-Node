package router

import (
	"AuthinGo/controllers"
	"AuthinGo/middlewares"
	"AuthinGo/utilities"

	chi "github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type Router interface {
	Register(r chi.Router)
}

func SetupRouter(UserRouter Router, RoleRouter Router) *chi.Mux {
	chiRouter := chi.NewRouter()

	chiRouter.Use(middleware.Logger)

	chiRouter.Use(middlewares.RateLimitMiddleware)

	chiRouter.Get("/ping", controllers.PingHandler)

	chiRouter.HandleFunc("/fakestoreservice/", utilities.ProxyToService("http://fakestoreapi.in", "/fakestroreservice"))
	
	UserRouter.Register(chiRouter)
	RoleRouter.Register(chiRouter)

	return chiRouter
}
