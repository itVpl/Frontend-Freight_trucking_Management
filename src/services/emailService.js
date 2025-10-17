import { BASE_API_URL } from '../apiConfig';

class EmailService {
  constructor() {
    this.baseURL = `${BASE_API_URL}/api/v1/email`;
  }

  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  // Fetch all emails for the current user
  async getEmails(folder = 'inbox', page = 1, limit = 50) {
    try {
      const response = await fetch(
        `${this.baseURL}/emails?folder=${folder}&page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  // Get a specific email by ID
  async getEmailById(emailId) {
    try {
      const response = await fetch(`${this.baseURL}/emails/${emailId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching email:', error);
      throw error;
    }
  }

  // Send a new email
  async sendEmail(emailData) {
    try {
      const response = await fetch(`${this.baseURL}/send`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Reply to an email
  async replyToEmail(emailId, replyData) {
    try {
      const response = await fetch(`${this.baseURL}/emails/${emailId}/reply`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(replyData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error replying to email:', error);
      throw error;
    }
  }

  // Forward an email
  async forwardEmail(emailId, forwardData) {
    try {
      const response = await fetch(`${this.baseURL}/emails/${emailId}/forward`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(forwardData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error forwarding email:', error);
      throw error;
    }
  }

  // Mark email as read/unread
  async markEmailAsRead(emailId, isRead = true) {
    try {
      const response = await fetch(`${this.baseURL}/emails/${emailId}/read`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ isRead }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error marking email as read:', error);
      throw error;
    }
  }

  // Star/unstar an email
  async toggleEmailStar(emailId, isStarred) {
    try {
      const response = await fetch(`${this.baseURL}/emails/${emailId}/star`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ isStarred }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error toggling email star:', error);
      throw error;
    }
  }

  // Move email to folder (inbox, sent, drafts, trash, etc.)
  async moveEmailToFolder(emailId, folder) {
    try {
      const response = await fetch(`${this.baseURL}/emails/${emailId}/move`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ folder }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error moving email to folder:', error);
      throw error;
    }
  }

  // Delete an email (move to trash)
  async deleteEmail(emailId) {
    try {
      const response = await fetch(`${this.baseURL}/emails/${emailId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting email:', error);
      throw error;
    }
  }

  // Permanently delete an email from trash
  async permanentlyDeleteEmail(emailId) {
    try {
      const response = await fetch(`${this.baseURL}/emails/${emailId}/permanent`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error permanently deleting email:', error);
      throw error;
    }
  }

  // Search emails
  async searchEmails(query, folder = null, page = 1, limit = 50) {
    try {
      let url = `${this.baseURL}/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
      if (folder) {
        url += `&folder=${folder}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching emails:', error);
      throw error;
    }
  }

  // Get email statistics (unread count, folder counts, etc.)
  async getEmailStats() {
    try {
      const response = await fetch(`${this.baseURL}/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching email stats:', error);
      throw error;
    }
  }

  // Upload attachment
  async uploadAttachment(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseURL}/attachments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  }

  // Download attachment
  async downloadAttachment(emailId, attachmentId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseURL}/emails/${emailId}/attachments/${attachmentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.blob();
    } catch (error) {
      console.error('Error downloading attachment:', error);
      throw error;
    }
  }

  // Get email templates
  async getEmailTemplates() {
    try {
      const response = await fetch(`${this.baseURL}/templates`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching email templates:', error);
      throw error;
    }
  }

  // Save email as draft
  async saveDraft(draftData) {
    try {
      const response = await fetch(`${this.baseURL}/drafts`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(draftData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  }

  // Update draft
  async updateDraft(draftId, draftData) {
    try {
      const response = await fetch(`${this.baseURL}/drafts/${draftId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(draftData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating draft:', error);
      throw error;
    }
  }

  // Delete draft
  async deleteDraft(draftId) {
    try {
      const response = await fetch(`${this.baseURL}/drafts/${draftId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting draft:', error);
      throw error;
    }
  }

  // Bulk operations
  async bulkMarkAsRead(emailIds, isRead = true) {
    try {
      const response = await fetch(`${this.baseURL}/bulk/read`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ emailIds, isRead }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error bulk marking emails as read:', error);
      throw error;
    }
  }

  async bulkDeleteEmails(emailIds) {
    try {
      const response = await fetch(`${this.baseURL}/bulk/delete`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ emailIds }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error bulk deleting emails:', error);
      throw error;
    }
  }

  async bulkMoveEmails(emailIds, folder) {
    try {
      const response = await fetch(`${this.baseURL}/bulk/move`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ emailIds, folder }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error bulk moving emails:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const emailService = new EmailService();
export default emailService;
