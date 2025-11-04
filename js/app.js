// Vue.js 应用
new Vue({
    el: '#app',
    data: {
        // 联系人列表
        contacts: [],
        
        // 当前编辑的联系人
        currentContact: {
            id: null,
            name: '',
            phone: '',
            email: '',
            address: ''
        },
        
        // 编辑状态
        isEditing: false,
        
        // 加载状态
        loading: false,
        
        // 消息提示
        message: '',
        messageType: 'success'
    },
    
    // 页面加载时执行
    mounted() {
        this.fetchContacts();
    },
    
    methods: {
        // 显示消息提示
        showMessage(text, type = 'success') {
            this.message = text;
            this.messageType = type;
            setTimeout(() => {
                this.message = '';
            }, 3000);
        },
        
        // 获取所有联系人
        async fetchContacts() {
            this.loading = true;
            try {
                const response = await fetch('http://localhost:8080/api/contacts');
                if (!response.ok) {
                    throw new Error('Failed to get contact');
                }
                this.contacts = await response.json();
                this.showMessage('Contact list loaded successfully');
            } catch (error) {
                console.error('Failed to get contact:', error);
                this.showMessage('Failed to get the contact.Please check the backend service', 'error');
            } finally {
                this.loading = false;
            }
        },
        
        // 保存联系人（添加或更新）
        async saveContact() {
            try {
                let response;
                let successMessage;
                
                if (this.isEditing) {
                    // 更新联系人
                    response = await fetch(`http://localhost:8080/api/contacts/${this.currentContact.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(this.currentContact)
                    });
                    successMessage = 'Contact updated successfully';
                } else {
                    // 添加联系人
                    response = await fetch('http://localhost:8080/api/contacts', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(this.currentContact)
                    });
                    successMessage = 'Contact added successfully';
                }
                
                if (response.ok) {
                    this.resetForm();
                    await this.fetchContacts(); // 重新加载列表
                    this.showMessage(successMessage);
                } else {
                    throw new Error('operation failure');
                }
            } catch (error) {
                console.error('Failed to save contact:', error);
                this.showMessage('Operation failed, please check the network connection', 'error');
            }
        },
        
        // 编辑联系人
        editContact(contact) {
            this.currentContact = {
                id: contact.id,
                name: contact.name,
                phone: contact.phone,
                email: contact.email || '',
                address: contact.address || ''
            };
            this.isEditing = true;
            
            // 滚动到表单位置
            this.$nextTick(() => {
                document.querySelector('.form-section').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        },
        
        // 删除联系人
        async deleteContact(id) {
            if (confirm('Are you sure you want to delete this contact? This operation cannot be undone')) {
                try {
                    const response = await fetch(`http://localhost:8080/api/contacts/${id}`, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        await this.fetchContacts(); // 重新加载列表
                        this.showMessage('Contact deleted successfully');
                    } else {
                        throw new Error('Delete failed!');
                    }
                } catch (error) {
                    console.error('Failed to delete contact:', error);
                    this.showMessage('Delete failed, please check the network connection', 'error');
                }
            }
        },
        
        // 取消编辑
        cancelEdit() {
            this.resetForm();
        },
        
        // 重置表单
        resetForm() {
            this.currentContact = {
                id: null,
                name: '',
                phone: '',
                email: '',
                address: ''
            };
            this.isEditing = false;
        }
    }
});
