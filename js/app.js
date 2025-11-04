// Contact Manager Class - Uses LocalStorage
class ContactManager {
    constructor() {
        this.storageKey = 'contacts_data';
        this.currentEditId = null;
        this.init();
    }

    // Initialize the application
    init() {
        // Initialize with sample data if local storage is empty
        if (!localStorage.getItem(this.storageKey)) {
            const sampleContacts = [
                { id: 1, name: "John Smith", phone: "1234567890", email: "john.smith@example.com" },
                { id: 2, name: "Emily Johnson", phone: "0987654321", email: "emily.johnson@example.com" },
                { id: 3, name: "Michael Brown", phone: "5551234567", email: "michael.brown@example.com" }
            ];
            this.saveContacts(sampleContacts);
        }
        this.setupEventListeners();
        this.displayContacts();
    }

    // Set up all event listeners
    setupEventListeners() {
        // Add contact button
        document.getElementById('addContactBtn').addEventListener('click', () => {
            this.addContactFromForm();
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchContacts(e.target.value);
        });

        // Clear search
        document.getElementById('clearSearch').addEventListener('click', () => {
            document.getElementById('searchInput').value = '';
            this.displayContacts();
        });

        // Allow form submission with Enter key
        document.getElementById('contactForm').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addContactFromForm();
            }
        });
    }

    // Get all contacts from local storage
    getContacts() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    // Save contacts to local storage
    saveContacts(contacts) {
        localStorage.setItem(this.storageKey, JSON.stringify(contacts));
    }

    // Add contact from form data
    addContactFromForm() {
        const name = document.getElementById('contactName').value.trim();
        const phone = document.getElementById('contactPhone').value.trim();
        const email = document.getElementById('contactEmail').value.trim();

        // Validation
        if (!name) {
            this.showMessage('Name is required!', 'error');
            document.getElementById('contactName').focus();
            return;
        }

        if (!phone) {
            this.showMessage('Phone number is required!', 'error');
            document.getElementById('contactPhone').focus();
            return;
        }

        // Basic phone validation
        if (!this.isValidPhone(phone)) {
            this.showMessage('Please enter a valid phone number!', 'error');
            document.getElementById('contactPhone').focus();
            return;
        }

        // Basic email validation (if provided)
        if (email && !this.isValidEmail(email)) {
            this.showMessage('Please enter a valid email address!', 'error');
            document.getElementById('contactEmail').focus();
            return;
        }

        if (this.currentEditId) {
            // Edit mode
            this.updateContact(this.currentEditId, { name, phone, email });
            this.currentEditId = null;
            document.getElementById('addContactBtn').textContent = 'Add Contact';
            this.showMessage('Contact updated successfully!', 'success');
        } else {
            // Add mode
            this.addContact({ name, phone, email });
        }

        // Clear form
        this.clearForm();
    }

    // Add a new contact
    addContact(contact) {
        const contacts = this.getContacts();
        const newId = contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1;
        const newContact = { ...contact, id: newId };
        contacts.push(newContact);
        this.saveContacts(contacts);
        this.displayContacts();
        this.showMessage(`Contact "${contact.name}" added successfully!`, 'success');
        return newContact;
    }

    // Update an existing contact
    updateContact(id, updatedContact) {
        const contacts = this.getContacts();
        const index = contacts.findIndex(contact => contact.id === id);
        if (index !== -1) {
            const oldName = contacts[index].name;
            contacts[index] = { ...updatedContact, id: id };
            this.saveContacts(contacts);
            this.displayContacts();
            this.showMessage(`Contact "${oldName}" updated successfully!`, 'success');
            return true;
        }
        return false;
    }

    // Delete a contact
    deleteContact(id) {
        const contacts = this.getContacts();
        const contactToDelete = contacts.find(contact => contact.id === id);
        const contactName = contactToDelete ? contactToDelete.name : '';

        if (confirm(`Are you sure you want to delete contact "${contactName}"?`)) {
            const filteredContacts = contacts.filter(contact => contact.id !== id);
            this.saveContacts(filteredContacts);
            this.displayContacts();
            this.showMessage(`Contact "${contactName}" deleted successfully!`, 'success');
            return true;
        }
        return false;
    }

    // Edit a contact (populate form with contact data)
    editContact(id) {
        const contacts = this.getContacts();
        const contact = contacts.find(contact => contact.id === id);
        if (contact) {
            // Populate form
            document.getElementById('contactName').value = contact.name;
            document.getElementById('contactPhone').value = contact.phone;
            document.getElementById('contactEmail').value = contact.email || '';
            
            // Switch to edit mode
            this.currentEditId = id;
            document.getElementById('addContactBtn').textContent = 'Update Contact';
            
            // Scroll to form
            document.getElementById('contactForm').scrollIntoView({ behavior: 'smooth' });
            
            // Focus on name field
            document.getElementById('contactName').focus();
        }
    }

    // Search contacts by name, phone, or email
    searchContacts(keyword) {
        const contacts = this.getContacts();
        if (!keyword.trim()) {
            this.displayContacts(contacts);
            return;
        }

        const searchTerm = keyword.toLowerCase();
        const filteredContacts = contacts.filter(contact => 
            contact.name.toLowerCase().includes(searchTerm) ||
            contact.phone.includes(searchTerm) ||
            (contact.email && contact.email.toLowerCase().includes(searchTerm))
        );
        
        this.displayContacts(filteredContacts);
        
        // Show search results message
        if (filteredContacts.length === 0) {
            this.showMessage('No contacts found matching your search.', 'info');
        }
    }

    // Display contacts in the list
    displayContacts(contacts = null) {
        const contactsToDisplay = contacts || this.getContacts();
        const contactsList = document.getElementById('contactsList');
        
        if (contactsToDisplay.length === 0) {
            contactsList.innerHTML = `
                <div class="empty-state">
                    <p>No contacts found</p>
                    <p>Click "Add Contact" to create your first contact</p>
                </div>
            `;
            return;
        }

        contactsList.innerHTML = contactsToDisplay.map(contact => `
            <div class="contact-item" data-id="${contact.id}">
                <div class="contact-info">
                    <h3>${this.escapeHtml(contact.name)}</h3>
                    <p>Phone: ${this.escapeHtml(contact.phone)}</p>
                    ${contact.email ? `<p>Email: ${this.escapeHtml(contact.email)}</p>` : ''}
                </div>
                <div class="contact-actions">
                    <button class="btn btn-edit" onclick="contactManager.editContact(${contact.id})">Edit</button>
                    <button class="btn btn-delete" onclick="contactManager.deleteContact(${contact.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    // Clear the form
    clearForm() {
        document.getElementById('contactName').value = '';
        document.getElementById('contactPhone').value = '';
        document.getElementById('contactEmail').value = '';
        document.getElementById('contactName').focus();
    }

    // Show message to user
    showMessage(message, type = 'info') {
        // Remove existing message
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        
        // Add to page (after header)
        const header = document.querySelector('header');
        header.parentNode.insertBefore(messageDiv, header.nextSibling);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 4000);
    }

    // Export contacts to JSON file
    exportContacts() {
        const contacts = this.getContacts();
        if (contacts.length === 0) {
            this.showMessage('No contacts to export!', 'error');
            return;
        }

        const dataStr = JSON.stringify(contacts, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'contacts_backup.json';
        link.click();
        
        this.showMessage('Contacts exported successfully!', 'success');
    }

    // Import contacts from JSON file
    importContacts(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const contacts = JSON.parse(e.target.result);
                if (Array.isArray(contacts)) {
                    // Validate contacts structure
                    const validContacts = contacts.filter(contact => 
                        contact && typeof contact === 'object' && 
                        contact.name && contact.phone
                    );
                    
                    if (validContacts.length > 0) {
                        this.saveContacts(validContacts);
                        this.displayContacts();
                        this.showMessage(`Successfully imported ${validContacts.length} contacts!`, 'success');
                    } else {
                        throw new Error('No valid contacts found in file');
                    }
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                this.showMessage('Import failed: Invalid file format', 'error');
                console.error('Import error:', error);
            }
        };
        reader.onerror = () => {
            this.showMessage('Error reading file', 'error');
        };
        reader.readAsText(file);
        
        // Clear file input
        event.target.value = '';
    }

    // Utility: HTML escape to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Utility: Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Utility: Validate phone format (basic)
    isValidPhone(phone) {
        // Allow numbers, spaces, hyphens, parentheses
        const phoneRegex = /^[\d\s\-\(\)\+]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
    }

    // Get contact statistics
    getStats() {
        const contacts = this.getContacts();
        return {
            total: contacts.length,
            withEmail: contacts.filter(c => c.email).length,
            withoutEmail: contacts.filter(c => !c.email).length
        };
    }
}

// Create global contact manager instance
const contactManager = new ContactManager();

// Page loaded event
document.addEventListener('DOMContentLoaded', function() {
    console.log('Contact Management System initialized successfully');
    
    // Display initial stats in console (for debugging)
    const stats = contactManager.getStats();
    console.log(`Loaded ${stats.total} contacts (${stats.withEmail} with email)`);
});