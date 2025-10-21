package controllers

import (
	"AuthinGo/dto"
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

func (rc *RoleController) AssisgnRoleToUser(w http.ResponseWriter, r*http.Request) {
	userId := chi.URLParam(r, "userId")
	roleId := chi.URLParam(r, "roleId")

	if userId == "" {
		utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "User ID is required", fmt.Errorf("missing userId"))
		return
	}

	if roleId == "" {
		utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "Role ID is required", fmt.Errorf("missing roleId"))
		return
	}

	roleIdInt, err := strconv.ParseInt(roleId, 10, 64)
	if err != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "Invalid role ID", err)
		return
	}

	userIdInt, err := strconv.ParseInt(userId, 10, 64)
	if err != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "Invalid user ID", err)
		return
	}

	err = rc.RoleService.AssignRoleToUser(userIdInt, roleIdInt)
	if err != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusInternalServerError, "Failed to assign role to user", err)
		return
	}

	utilities.WriteJsonSuccessResponse(w, http.StatusOK, "Role assigned to user successfully", nil)
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

func (rc *RoleController) CreateRole(w http.ResponseWriter, r*http.Request) {
	payload := r.Context().Value("payload").(dto.CreateRoleRequestDTO)

	role, err := rc.RoleService.CreateRole(payload.Name, payload.Description)
	if err != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusInternalServerError, "Failed to create role", err)
		return
	}

	utilities.WriteJsonSuccessResponse(w, http.StatusCreated, "Role created successfully", role)
}


func (rc *RoleController) UpdateRole(w http.ResponseWriter, r *http.Request) {
	roleId := chi.URLParam(r, "id")
	if roleId == "" {
		utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "Invalid role ID", fmt.Errorf("missiong role ID"))
		return
	}

	id, err := strconv.ParseInt(roleId, 10, 64)
	if err != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "Invalid role ID", err)
		return
	}

	payload := r.Context().Value("payload").(dto.UpdateRoleRequestDTO)

	role, err := rc.RoleService.UpdateRole(id, payload.Name, payload.Description)
	if err != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusInternalServerError, "Failed to update role", err)
		return
	}

	utilities.WriteJsonSuccessResponse(w, http.StatusOK, "Role updated successfully", role)
}

func (rc *RoleController) DeleteRole(w http.ResponseWriter, r *http.Request) {
	roleId := chi.URLParam(r, "id")
	if roleId == "" {
		utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "Role ID is required", fmt.Errorf("missing role ID"))
		return
	}

	id, err := strconv.ParseInt(roleId, 10, 64)
	if err != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusInternalServerError, "Invalid role ID", err)
		return
	}

	err = rc.RoleService.DeleteRoleById(id)
	if err != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusInternalServerError, "Failed to delete role", err)
		return
	}

	utilities.WriteJsonSuccessResponse(w, http.StatusOK, "Role deleted successfully", nil)
}

func (rc *RoleController) GetRolePermissions(w http.ResponseWriter, r *http.Request) {
	roleId := chi.URLParam(r, "id")
	if roleId == "" {
		utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "Invalid role ID", fmt.Errorf("missing role ID"))
		return
	}

	id, err := strconv.ParseInt(roleId, 10, 64)
	if err != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "Invalid role ID", err)
		return
	}

	rolePermissions, err := rc.RoleService.GetRolePermissions(id)
	if err != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusInternalServerError, "Failed to fetch role permissions", err)
		return
	}

	utilities.WriteJsonSuccessResponse(w, http.StatusOK, "Role permissions fetched successfully", rolePermissions)
}

func (rc *RoleController) AssignPermissionToRole(w http.ResponseWriter, r *http.Request) {
	roleId := chi.URLParam(r, "id")
	if roleId == "" {
		utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "Role ID is required", fmt.Errorf("missing role ID"))
		return
	}

	id, err := strconv.ParseInt(roleId, 10, 64)
	if err != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "Invalid role ID", err)
		return
	}

	payload := r.Context().Value("payload").(dto.AssignPermissionRequestDTO)

	rolePermission, err := rc.RoleService.AddPermissionToRole(id, payload.PermissionId)
	if err != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusInternalServerError, "Failed to assign permission to role", err)
		return
	}

	utilities.WriteJsonSuccessResponse(w, http.StatusOK, "Permission assigned to role successfully", rolePermission)

}

func (rc *RoleController) RemovePermissionFromRole(w http.ResponseWriter, r *http.Request) {
	roleId := chi.URLParam(r, "id")
	if roleId == "" {
		utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "Role ID is required", fmt.Errorf("missing role ID"))
		return
	}

	id, err := strconv.ParseInt(roleId, 10, 64)
	if err != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusBadRequest, "Invalid role ID", err)
		return
	}

	payload := r.Context().Value("payload").(dto.RemovePermissionRequestDTO)

	err = rc.RoleService.RemovePermissionFromRole(id, payload.PermissionId)
	if err != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusInternalServerError, "Failed to remove permission from role", err)
		return
	}

	utilities.WriteJsonSuccessResponse(w, http.StatusOK, "Permission removed from role successfully", nil)
}

func (rc *RoleController) GetAllRolePermissions(w http.ResponseWriter, r*http.Request) {
	rolePermission, err := rc.RoleService.GetAllRolePermissions()
	if err != nil {
		utilities.WriteJsonErrorResponse(w, http.StatusInternalServerError, "Failed to fetch role permissions", err)
		return
	}

	utilities.WriteJsonSuccessResponse(w, http.StatusOK, "Role permissions fetched successfully", rolePermission)
}


