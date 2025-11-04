// 联系人管理器 - 使用 LocalStorage
class ContactManager {
    constructor() {
        this.storageKey = 'contacts_data';
        this.currentEditId = null;
        this.init();
    }

    // 初始化
    init() {
        // 如果本地存储为空，初始化示例数据
        if (!localStorage.getItem(this.storageKey)) {
            const mockContacts = [
                { id: 1, name: "张三", phone: "13800138000", email: "zhangsan@example.com" },
                { id: 2, name: "李四", phone: "13900139000", email: "lisi@example.com" },
                { id: 3, name: "王五", phone: "13700137000", email: "wangwu@example.com" }
            ];
            this.saveContacts(mockContacts);
        }
        this.setupEventListeners();
        this.displayContacts();
    }

    // 设置事件监听器
    setupEventListeners() {
        // 添加联系人按钮
        document.getElementById('addContactBtn').addEventListener('click', () => {
            this.addContactFromForm();
        });

        // 搜索功能
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchContacts(e.target.value);
        });

        // 清空搜索
        document.getElementById('clearSearch').addEventListener('click', () => {
            document.getElementById('searchInput').value = '';
            this.displayContacts();
        });
    }

    // 获取所有联系人
    getContacts() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    // 保存联系人列表
    saveContacts(contacts) {
        localStorage.setItem(this.storageKey, JSON.stringify(contacts));
    }

    // 从表单添加联系人
    addContactFromForm() {
        const name = document.getElementById('contactName').value.trim();
        const phone = document.getElementById('contactPhone').value.trim();
        const email = document.getElementById('contactEmail').value.trim();

        if (!name || !phone) {
            alert('姓名和电话是必填项！');
            return;
        }

        if (this.currentEditId) {
            // 编辑模式
            this.updateContact(this.currentEditId, { name, phone, email });
            this.currentEditId = null;
            document.getElementById('addContactBtn').textContent = '添加联系人';
        } else {
            // 添加模式
            this.addContact({ name, phone, email });
        }

        // 清空表单
        this.clearForm();
    }

    // 添加联系人
    addContact(contact) {
        const contacts = this.getContacts();
        const newId = contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1;
        const newContact = { ...contact, id: newId };
        contacts.push(newContact);
        this.saveContacts(contacts);
        this.displayContacts();
        
        // 显示成功消息
        this.showMessage(`联系人 "${contact.name}" 添加成功！`, 'success');
        return newContact;
    }

    // 更新联系人
    updateContact(id, updatedContact) {
        const contacts = this.getContacts();
        const index = contacts.findIndex(contact => contact.id === id);
        if (index !== -1) {
            const oldName = contacts[index].name;
            contacts[index] = { ...updatedContact, id: id };
            this.saveContacts(contacts);
            this.displayContacts();
            
            // 显示成功消息
            this.showMessage(`联系人 "${oldName}" 更新成功！`, 'success');
            return true;
        }
        return false;
    }

    // 删除联系人
    deleteContact(id) {
        const contacts = this.getContacts();
        const contactToDelete = contacts.find(contact => contact.id === id);
        const contactName = contactToDelete ? contactToDelete.name : '';

        if (confirm(`确定要删除联系人 "${contactName}" 吗？`)) {
            const filteredContacts = contacts.filter(contact => contact.id !== id);
            this.saveContacts(filteredContacts);
            this.displayContacts();
            
            // 显示成功消息
            this.showMessage(`联系人 "${contactName}" 删除成功！`, 'success');
            return true;
        }
        return false;
    }

    // 编辑联系人
    editContact(id) {
        const contacts = this.getContacts();
        const contact = contacts.find(contact => contact.id === id);
        if (contact) {
            // 填充表单
            document.getElementById('contactName').value = contact.name;
            document.getElementById('contactPhone').value = contact.phone;
            document.getElementById('contactEmail').value = contact.email || '';
            
            // 切换到编辑模式
            this.currentEditId = id;
            document.getElementById('addContactBtn').textContent = '更新联系人';
            
            // 滚动到表单
            document.getElementById('contactForm').scrollIntoView({ behavior: 'smooth' });
        }
    }

    // 搜索联系人
    searchContacts(keyword) {
        const contacts = this.getContacts();
        if (!keyword) {
            this.displayContacts(contacts);
            return;
        }

        const filteredContacts = contacts.filter(contact => 
            contact.name.toLowerCase().includes(keyword.toLowerCase()) ||
            contact.phone.includes(keyword) ||
            (contact.email && contact.email.toLowerCase().includes(keyword.toLowerCase()))
        );
        
        this.displayContacts(filteredContacts);
    }

    // 显示联系人列表
    displayContacts(contacts = null) {
        const contactsToDisplay = contacts || this.getContacts();
        const contactsList = document.getElementById('contactsList');
        
        if (contactsToDisplay.length === 0) {
            contactsList.innerHTML = `
                <div class="empty-state">
                    <p>暂无联系人</p>
                    <p>点击"添加联系人"按钮开始添加</p>
                </div>
            `;
            return;
        }

        contactsList.innerHTML = contactsToDisplay.map(contact => `
            <div class="contact-item" data-id="${contact.id}">
                <div class="contact-info">
                    <h3>${this.escapeHtml(contact.name)}</h3>
                    <p>📞 ${this.escapeHtml(contact.phone)}</p>
                    ${contact.email ? `<p>📧 ${this.escapeHtml(contact.email)}</p>` : ''}
                </div>
                <div class="contact-actions">
                    <button class="btn-edit" onclick="contactManager.editContact(${contact.id})">编辑</button>
                    <button class="btn-delete" onclick="contactManager.deleteContact(${contact.id})">删除</button>
                </div>
            </div>
        `).join('');
    }

    // 清空表单
    clearForm() {
        document.getElementById('contactName').value = '';
        document.getElementById('contactPhone').value = '';
        document.getElementById('contactEmail').value = '';
    }

    // 显示消息
    showMessage(message, type = 'info') {
        // 移除现有消息
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // 创建新消息
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        
        // 添加到页面顶部
        document.body.insertBefore(messageDiv, document.body.firstChild);
        
        // 3秒后自动消失
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }

    // HTML转义，防止XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 导出联系人（可选功能）
    exportContacts() {
        const contacts = this.getContacts();
        const dataStr = JSON.stringify(contacts, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'contacts_backup.json';
        link.click();
        
        this.showMessage('联系人导出成功！', 'success');
    }

    // 导入联系人（可选功能）
    importContacts(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const contacts = JSON.parse(e.target.result);
                if (Array.isArray(contacts)) {
                    this.saveContacts(contacts);
                    this.displayContacts();
                    this.showMessage('联系人导入成功！', 'success');
                } else {
                    throw new Error('文件格式错误');
                }
            } catch (error) {
                this.showMessage('导入失败：文件格式不正确', 'error');
            }
        };
        reader.readAsText(file);
        
        // 清空文件输入
        event.target.value = '';
    }
}

// 创建全局联系管理器实例
const contactManager = new ContactManager();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 所有初始化逻辑已经在 ContactManager 构造函数中处理
    console.log('通讯录系统已初始化');
});