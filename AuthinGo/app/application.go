package app

import (
	"fmt"
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

func NewConfig(addr string) Config {
	return Config{
		Addr: addr,
	}
}

func NewApplication(cfg Config) *Application {
	return &Application{
		Config: cfg,
	}
}

func (app *Application) Run() error {

	server := &http.Server {
		Addr: app.Config.Addr, 
		Handler: nil, // TODO: Setup a chi router
		ReadTimeout: 10 * time.Second, // set read timeout
		WriteTimeout: 10 * time.Second, // set write timeout
	}

	fmt.Println("Starting server on", app.Config.Addr)

	return server.ListenAndServe()
}

