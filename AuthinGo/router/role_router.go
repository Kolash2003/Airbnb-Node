package router

import (
	"AuthinGo/controllers"
	"AuthinGo/middlewares"

	"github.com/go-chi/chi/v5"
)

type RoleRouter struct {
	roleController *controllers.RoleController
}

func NewRoleRouter(_roleController *controllers.RoleController) Router {
	return &RoleRouter{
		roleController: _roleController,
	}
}

func (rr *RoleRouter) Register(r chi.Router) {
	r.Get("/roles/{id}", rr.roleController.GetRoleById)
	r.Get("/roles", rr.roleController.GetAllRoles)
	r.With(middlewares.CreateRoleRequestValidator).Post("/roles", rr.roleController.CreateRole)
	r.With(middlewares.UpdateRoleRequestValidator).Put("/roles/{id}", rr.roleController.UpdateRole)
	r.Delete("/roles/{id}", rr.roleController.DeleteRole)

	// Roles permissions routes
	r.Get("/roles/{roleId}/permissions", rr.roleController.GetRolePermissions)
	r.With(middlewares.AssignPermissionRequestValidator).Post("/roles/{roleId}/permissions", rr.roleController.AssignPermissionToRole)
	r.With(middlewares.RemovePermissionRequestValidator).Delete("/roles/{roleId}/permissions", rr.roleController.RemovePermissionFromRole)
	r.Get("/role-permissions", rr.roleController.GetAllRolePermissions)
	r.With(middlewares.JWTAuthMiddleware, middlewares.RequireAllRoles("admin")).Post("/users/{userId}/roles/{roleId}", rr.roleController.AssisgnRoleToUser)

	// User roles — JWT-gated so only authenticated callers can query their own roles
	r.With(middlewares.JWTAuthMiddleware).Get("/users/{userId}/roles", rr.roleController.GetUserRoles)
}
