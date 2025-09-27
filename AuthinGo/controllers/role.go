package controllers

import (
	"AuthinGo/services"
	"AuthinGo/utilities"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type RoleController struct {
	RoleService services.RoleService
}

func NewRoleController(roleService services.RoleService) *RoleController {
	return &RoleController{
		RoleService: roleService,
	}
}

func (rc *RoleController) GetRoleById(w http.ResponseWriter, r *http.Request) {
	fmt.Println("GetRoleById called in RoleController")

	roleId := chi.URLParam(r, "id") // Extract role ID from URL  parameters

	if roleId == "" {
		utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "Role ID is required", fmt.Errorf("missing roleId"))
		return
	}

	id, err := strconv.ParseInt(roleId, 10, 64)

	if err != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusBadGateway, "Invalid role ID", err)
		return
	}

	role, err := rc.RoleService.GetRoleById(id)

	if err != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusInternalServerError, "Failed to fetch role", err)
		return 
	}

	if role == nil {
		utilities.WriteJsonErrorResponse(w, http.StatusNotFound, "Role not found", fmt.Errorf("role with ID %d not found", id))
		return
	}

	utilities.WriteJsonSuccessResponse(w, http.StatusOK, "Role fetched sucessfully", role)

}

func (rc *RoleController) GetAllRoles(w http.ResponseWriter, r *http.Request) {
	roles, err := rc.RoleService.GetAllRoles()

	if err != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusInternalServerError, "Failed to fetch roles", err)
		return
	}

	utilities.WriteJsonSuccessResponse(w, http.StatusOK, "Roles fetched sucessfully", roles)
}


