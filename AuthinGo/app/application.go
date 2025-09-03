package app

import (
	dbConfig "AuthinGo/config/db"
	config "AuthinGo/config/env"
	"AuthinGo/controllers"
	repo "AuthinGo/db/repositories"
	"AuthinGo/router"
	"AuthinGo/services"
	"fmt"
	"log"
	"net/http"
	"time"
)

// Config holds the configuration for the server.
type Config struct {
	Addr string
}

type Application struct {
	Config Config
}

func NewConfig() Config {
	port := config.GetString("PORT", ":8080")

	return Config{
		Addr: port,
	}
}

func NewApplication(cfg Config) *Application {
	return &Application{
		Config: cfg,
	}
}

func (app *Application) Run() error {

	db, err := dbConfig.SetupDB()

	if err != nil {
		fmt.Println("Error setting up databse:", err)
	}


	ur := repo.NewUserRepository(db)
	us := services.NewUserService(ur)
	uc := controllers.NewUserController(us)
	uRouter := router.NewUserRouter(uc)

	server := &http.Server{
		Addr:         app.Config.Addr,
		Handler:      router.SetupRouter(uRouter),
		ReadTimeout:  10 * time.Second, // set read timeout to 10 seconds
		WriteTimeout: 10 * time.Second, // set write timeout to 10 seconds
	}

	log.Println("Starting server on", app.Config.Addr)

	return server.ListenAndServe()
}
