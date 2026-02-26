import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import dayjs from 'dayjs';

// MUI imports
import {
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Snackbar,
    Alert,
    Box,
    Typography,
    Paper,
    Grid,
    Divider,
    InputAdornment,
    IconButton,
    Chip,
} from '@mui/material';

import { DataGrid } from '@mui/x-data-grid';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import {
    FaSearch,
    FaPlus,
    FaEdit,
    FaTrashAlt,
    FaTimes,
    FaPills,
} from 'react-icons/fa';

const API_BASE = 'http://localhost:5000/api';
const CATEGORIES = [
    'Tablet',
    'Capsule',
    'Syrup',
    'Injection',
    'Ointment',
    'Drops',
    'Inhaler',
    'Supplement',
];

const emptyForm = {
    medicineId: '',
    name: '',
    category: '',
    unitPrice: '',
    stockQuantity: '',
    expiryDate: null,
    supplierId: '',
};

const MedicineInventory = () => {
    // ── state ──────────────────────────────────────────────
    const [form, setForm] = useState(emptyForm);
    const [medicines, setMedicines] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRow, setSelectedRow] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(false);

    // dialog
    const [dialog, setDialog] = useState({ open: false, type: '', title: '', message: '' });

    // snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const token = localStorage.getItem('medistock_token');
    const headers = { Authorization: `Bearer ${token}` };

    // ── data fetchers ──────────────────────────────────────
    const fetchMedicines = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/medicine-inv`, { headers });
            setMedicines(res.data.medicines || []);
        } catch (err) {
            console.error('Fetch medicines error:', err);
            showSnackbar('Failed to fetch medicines', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSuppliers = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE}/suppliers`, { headers });
            setSuppliers(res.data.suppliers || []);
        } catch (err) {
            console.error('Fetch suppliers error:', err);
        }
    }, []);

    useEffect(() => {
        fetchMedicines();
        fetchSuppliers();
    }, []);

    // ── helpers ────────────────────────────────────────────
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const resetForm = () => {
        setForm(emptyForm);
        setSelectedRow(null);
        setIsEditMode(false);
    };

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    // ── search ─────────────────────────────────────────────
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchMedicines();
            return;
        }
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/medicine-inv/search`, {
                headers,
                params: { query: searchQuery },
            });
            setMedicines(res.data.medicines || []);
        } catch (err) {
            showSnackbar('Search failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ── row click → populate form ──────────────────────────
    const handleRowClick = (params) => {
        const row = params.row;
        setForm({
            medicineId: row.medicineId,
            name: row.name,
            category: row.category,
            unitPrice: row.unitPrice,
            stockQuantity: row.stockQuantity,
            expiryDate: dayjs(row.expiryDate),
            supplierId: row.supplierObjId || '',
        });
        setSelectedRow(row);
        setIsEditMode(true);
    };

    // ── dialog open helpers ────────────────────────────────
    const openInsertDialog = () => {
        if (!form.medicineId || !form.name || !form.category || !form.unitPrice || !form.stockQuantity || !form.expiryDate || !form.supplierId) {
            showSnackbar('Please fill all fields', 'warning');
            return;
        }
        setDialog({
            open: true,
            type: 'insert',
            title: 'Confirm Insert',
            message: `Are you sure you want to add medicine "${form.name}" (ID: ${form.medicineId})?`,
        });
    };

    const openUpdateDialog = () => {
        if (!isEditMode) {
            showSnackbar('Select a record from the grid to update', 'warning');
            return;
        }
        setDialog({
            open: true,
            type: 'update',
            title: 'Confirm Update',
            message: `Are you sure you want to update medicine "${form.name}" (ID: ${form.medicineId})?`,
        });
    };

    const openDeleteDialog = () => {
        if (!isEditMode) {
            showSnackbar('Select a record from the grid to delete', 'warning');
            return;
        }
        setDialog({
            open: true,
            type: 'delete',
            title: 'Confirm Delete',
            message: `Are you sure you want to delete medicine "${form.name}" (ID: ${form.medicineId})? This action cannot be undone.`,
        });
    };

    // ── dialog confirm handler ─────────────────────────────
    const handleDialogConfirm = async () => {
        const { type } = dialog;
        setDialog({ ...dialog, open: false });

        const payload = {
            ...form,
            unitPrice: Number(form.unitPrice),
            stockQuantity: Number(form.stockQuantity),
            expiryDate: form.expiryDate ? dayjs(form.expiryDate).toISOString() : null,
        };

        try {
            if (type === 'insert') {
                await axios.post(`${API_BASE}/medicine-inv`, payload, { headers });
                showSnackbar('Medicine added successfully');
            } else if (type === 'update') {
                await axios.put(`${API_BASE}/medicine-inv/${form.medicineId}`, payload, { headers });
                showSnackbar('Medicine updated successfully');
            } else if (type === 'delete') {
                await axios.delete(`${API_BASE}/medicine-inv/${form.medicineId}`, { headers });
                showSnackbar('Medicine deleted successfully');
            }
            resetForm();
            fetchMedicines();
        } catch (err) {
            const msg = err.response?.data?.message || 'Operation failed';
            showSnackbar(msg, 'error');
        }
    };

    // ── DataGrid columns ──────────────────────────────────
    const columns = [
        { field: 'medicineId', headerName: 'Medicine ID', flex: 1, minWidth: 120 },
        { field: 'name', headerName: 'Name', flex: 1.3, minWidth: 140 },
        {
            field: 'category',
            headerName: 'Category',
            flex: 1,
            minWidth: 110,
            renderCell: (params) => (
                <Chip label={params.value} size="small" color="primary" variant="outlined" />
            ),
        },
        {
            field: 'unitPrice',
            headerName: 'Unit Price (₹)',
            flex: 0.8,
            minWidth: 110,
            type: 'number',
            renderCell: (params) => `₹${Number(params.value).toFixed(2)}`,
        },
        {
            field: 'stockQuantity',
            headerName: 'Stock Qty',
            flex: 0.7,
            minWidth: 90,
            type: 'number',
            renderCell: (params) => {
                const qty = params.value;
                const color = qty <= 10 ? '#ef4444' : qty <= 50 ? '#f59e0b' : '#22c55e';
                return (
                    <span style={{ fontWeight: 700, color }}>{qty}</span>
                );
            },
        },
        {
            field: 'expiryDate',
            headerName: 'Expiry Date',
            flex: 1,
            minWidth: 120,
            renderCell: (params) => dayjs(params.value).format('DD-MMM-YYYY'),
        },
        {
            field: 'supplierName',
            headerName: 'Supplier',
            flex: 1.1,
            minWidth: 130,
        },
    ];

    const rows = medicines.map((m) => ({
        id: m._id,
        medicineId: m.medicineId,
        name: m.name,
        category: m.category,
        unitPrice: m.unitPrice,
        stockQuantity: m.stockQuantity,
        expiryDate: m.expiryDate,
        supplierName: m.supplierId?.name || 'N/A',
        supplierObjId: m.supplierId?._id || '',
    }));

    // ── render ─────────────────────────────────────────────
    return (
        <Layout>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ pb: 4 }}>
                    {/* ── Header ────────────────────────────────── */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <FaPills size={28} color="#6366f1" />
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
                            Medicine Inventory Management
                        </Typography>
                    </Box>

                    {/* ── Search Bar ────────────────────────────── */}
                    <Paper
                        elevation={2}
                        sx={{
                            p: 2,
                            mb: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ mb: 1, color: '#6366f1', fontWeight: 700 }}>
                            Search by Medicine ID
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                size="small"
                                fullWidth
                                placeholder="Enter Medicine ID to search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FaSearch color="#94a3b8" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: searchQuery && (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    fetchMedicines();
                                                }}
                                            >
                                                <FaTimes size={14} />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ backgroundColor: '#fff', borderRadius: 2 }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleSearch}
                                sx={{
                                    minWidth: 100,
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                Search
                            </Button>
                        </Box>
                    </Paper>

                    {/* ── Form ──────────────────────────────────── */}
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            mb: 3,
                            borderRadius: 3,
                            border: '1px solid #e2e8f0',
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#334155' }}>
                                {isEditMode ? '✏️ Edit Medicine' : '➕ Add New Medicine'}
                            </Typography>
                            {isEditMode && (
                                <Button size="small" onClick={resetForm} sx={{ textTransform: 'none' }}>
                                    Clear / New
                                </Button>
                            )}
                        </Box>

                        <Divider sx={{ mb: 2.5 }} />

                        <Grid container spacing={2.5}>
                            {/* 1 — Medicine ID */}
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    label="Medicine ID"
                                    fullWidth
                                    size="small"
                                    required
                                    value={form.medicineId}
                                    onChange={handleChange('medicineId')}
                                    disabled={isEditMode}
                                    helperText={isEditMode ? 'Primary key — cannot edit' : ''}
                                />
                            </Grid>

                            {/* 2 — Medicine Name */}
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    label="Medicine Name"
                                    fullWidth
                                    size="small"
                                    required
                                    value={form.name}
                                    onChange={handleChange('name')}
                                />
                            </Grid>

                            {/* 3 — Category */}
                            <Grid item xs={12} sm={6} md={4}>
                                <FormControl fullWidth size="small" required>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        value={form.category}
                                        label="Category"
                                        onChange={handleChange('category')}
                                    >
                                        {CATEGORIES.map((cat) => (
                                            <MenuItem key={cat} value={cat}>
                                                {cat}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* 4 — Unit Price */}
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    label="Unit Price (₹)"
                                    fullWidth
                                    size="small"
                                    type="number"
                                    required
                                    value={form.unitPrice}
                                    onChange={handleChange('unitPrice')}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                    }}
                                />
                            </Grid>

                            {/* 5 — Stock Quantity */}
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    label="Stock Quantity"
                                    fullWidth
                                    size="small"
                                    type="number"
                                    required
                                    value={form.stockQuantity}
                                    onChange={handleChange('stockQuantity')}
                                />
                            </Grid>

                            {/* 6 — Expiry Date */}
                            <Grid item xs={12} sm={6} md={3}>
                                <DatePicker
                                    label="Expiry Date"
                                    value={form.expiryDate}
                                    onChange={(newVal) => setForm((prev) => ({ ...prev, expiryDate: newVal }))}
                                    slotProps={{
                                        textField: { size: 'small', fullWidth: true, required: true },
                                    }}
                                />
                            </Grid>

                            {/* 7 — Supplier ID */}
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small" required>
                                    <InputLabel>Supplier</InputLabel>
                                    <Select
                                        value={form.supplierId}
                                        label="Supplier"
                                        onChange={handleChange('supplierId')}
                                    >
                                        {suppliers.map((s) => (
                                            <MenuItem key={s._id} value={s._id}>
                                                {s.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        {/* ── Action Buttons ──────────────────────── */}
                        <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                startIcon={<FaPlus />}
                                onClick={openInsertDialog}
                                disabled={isEditMode}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                    '&:hover': { background: 'linear-gradient(135deg, #16a34a, #15803d)' },
                                }}
                            >
                                Insert
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<FaEdit />}
                                onClick={openUpdateDialog}
                                disabled={!isEditMode}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
                                }}
                            >
                                Update
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<FaTrashAlt />}
                                onClick={openDeleteDialog}
                                disabled={!isEditMode}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    '&:hover': { background: 'linear-gradient(135deg, #dc2626, #b91c1c)' },
                                }}
                            >
                                Delete
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={resetForm}
                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                            >
                                Clear
                            </Button>
                        </Box>
                    </Paper>

                    {/* ── Data Grid ─────────────────────────────── */}
                    <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                        <Box
                            sx={{
                                px: 3,
                                py: 2,
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: '#fff',
                            }}
                        >
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                📋 Inventory Records ({medicines.length})
                            </Typography>
                        </Box>
                        <Box sx={{ height: 480, width: '100%' }}>
                            <DataGrid
                                rows={rows}
                                columns={columns}
                                loading={loading}
                                pageSizeOptions={[5, 10, 25]}
                                initialState={{
                                    pagination: { paginationModel: { pageSize: 10 } },
                                }}
                                onRowClick={handleRowClick}
                                disableRowSelectionOnClick={false}
                                sx={{
                                    border: 'none',
                                    '& .MuiDataGrid-row': {
                                        cursor: 'pointer',
                                        '&:hover': { backgroundColor: '#eef2ff' },
                                    },
                                    '& .MuiDataGrid-columnHeaders': {
                                        backgroundColor: '#f8fafc',
                                        fontWeight: 700,
                                    },
                                }}
                            />
                        </Box>
                    </Paper>
                </Box>

                {/* ── Confirmation Dialog ─────────────────────── */}
                <Dialog
                    open={dialog.open}
                    onClose={() => setDialog({ ...dialog, open: false })}
                    PaperProps={{ sx: { borderRadius: 3, minWidth: 380 } }}
                >
                    <DialogTitle sx={{ fontWeight: 700 }}>{dialog.title}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{dialog.message}</DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button
                            onClick={() => setDialog({ ...dialog, open: false })}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleDialogConfirm}
                            color={dialog.type === 'delete' ? 'error' : 'primary'}
                            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                        >
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* ── Snackbar ────────────────────────────────── */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        severity={snackbar.severity}
                        variant="filled"
                        sx={{ width: '100%', borderRadius: 2 }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </LocalizationProvider>
        </Layout>
    );
};

export default MedicineInventory;
