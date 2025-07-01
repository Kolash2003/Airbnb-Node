export interface NotificationDto {
    to: string; // Email address to the recipient
    subject: string; // Subject of the email
    templateId: string; // ID of the template to use
    params: Record<string, any>; // Parameters to replace in the template
}

