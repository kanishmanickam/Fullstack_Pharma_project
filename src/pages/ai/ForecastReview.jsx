import { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import axiosInstance from '../../utils/axiosConfig';
import dayjs from 'dayjs';
import {
    FaBrain, FaSearch, FaCheck, FaEdit, FaTrash, FaPlus, FaFilter, FaSync, FaExclamationTriangle
} from 'react-icons/fa';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
    Box, Typography, Paper, TextField, Button, Grid, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem,
    FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination
} from '@mui/material';
import { toast } from 'react-hot-toast';

export default function ForecastReview() {
    const [recommendations, setRecommendations] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ priority: '', status: 'pending' });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Dialog states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('add'); // add, edit
    const [formData, setFormData] = useState({
        medicineId: '',
        medicineName: '',
        optimalReorderQty: 0,
        priority: 'medium',
        restockingDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
    });
    const [medicines, setMedicines] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [recRes, trendRes] = await Promise.all([
                axiosInstance.get('/forecast/recommendations', { params: { search, ...filters } }),
                axiosInstance.get('/forecast/trend')
            ]);
            setRecommendations(recRes.data.recommendations);
            setTrendData(trendRes.data.trend);
        } catch (error) {
            toast.error('Failed to fetch forecast data');
        } finally {
            setLoading(false);
        }
    }, [search, filters]);

    useEffect(() => {
        fetchData();
        fetchMedicines();
    }, [fetchData]);

    const fetchMedicines = async () => {
        try {
            const { data } = await axiosInstance.get('/inventory');
            setMedicines(data.medicines || []);
        } catch (error) {
            console.error('Error fetching medicines', error);
        }
    };

    const handleStatusUpdate = async (id, status, approvedQty) => {
        try {
            await axiosInstance.put(`/forecast/recommendations/${id}`, { status, approvedQty });
            toast.success(`Recommendation ${status}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update recommendation');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this recommendation?')) return;
        try {
            await axiosInstance.delete(`/forecast/recommendations/${id}`);
            toast.success('Recommendation deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete recommendation');
        }
    };

    const handleModalSubmit = async () => {
        try {
            if (modalType === 'add') {
                const med = medicines.find(m => m._id === formData.medicineId);
                await axiosInstance.post('/forecast/recommendations', {
                    ...formData,
                    medicineName: med ? med.name : formData.medicineName
                });
                toast.success('Manual recommendation added');
            } else {
                await axiosInstance.put(`/forecast/recommendations/${formData._id}`, formData);
                toast.success('Recommendation updated');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const openEditModal = (rec) => {
        setModalType('edit');
        setFormData({
            ...rec,
            restockingDate: dayjs(rec.restockingDate).format('YYYY-MM-DD')
        });
        setIsModalOpen(true);
    };

    const getPriorityColor = (p) => {
        switch (p) {
            case 'critical': return 'error';
            case 'high': return 'warning';
            case 'medium': return 'primary';
            default: return 'default';
        }
    };

    return (
        <Layout>
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FaBrain size={30} color="#6366f1" />
                        <Typography variant="h4" fontWeight={800}>Forecast & Reorder Review</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<FaPlus />}
                            onClick={() => { setModalType('add'); setFormData({ medicineId: '', optimalReorderQty: 0, priority: 'medium', restockingDate: dayjs().add(7, 'day').format('YYYY-MM-DD') }); setIsModalOpen(true); }}
                        >
                            Add Manual
                        </Button>
                        <Button variant="contained" startIcon={<FaSync />} onClick={fetchData}>Refresh</Button>
                    </Box>
                </Box>

                {/* Trend Chart */}
                <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Predicted vs Actual Demand (Last 14 Days)</Typography>
                    <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="predicted" name="Predicted Units" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="actual" name="Actual Units" fill="#34d399" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>

                {/* Filters and Search */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField
                        size="small"
                        placeholder="Search medicine..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{ startAdornment: <FaSearch style={{ marginRight: 8, color: '#94a3b8' }} /> }}
                        sx={{ flexGrow: 1 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Priority</InputLabel>
                        <Select
                            value={filters.priority}
                            label="Priority"
                            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                        >
                            <option value="">All Priorities</option>
                            <MenuItem value="critical">Critical</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="low">Low</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={filters.status}
                            label="Status"
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="approved">Approved</MenuItem>
                            <MenuItem value="adjusted">Adjusted</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                    </FormControl>
                </Paper>

                {/* Recommendations Table */}
                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Medicine</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Stock / Predicted</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Rec. Qty</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Restock Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {recommendations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography color="textSecondary">No recommendations found.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recommendations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((rec) => (
                                    <TableRow key={rec._id} hover>
                                        <TableCell>
                                            <Typography variant="subtitle2" fontWeight={700}>{rec.medicineName}</Typography>
                                            <Typography variant="caption" color="textSecondary">{rec.category}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{rec.currentStock} / <b>{rec.predictedDemand}</b></Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={700} color="primary.main">{rec.optimalReorderQty}</Typography>
                                        </TableCell>
                                        <TableCell>{dayjs(rec.restockingDate).format('DD MMM YYYY')}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={rec.priority}
                                                size="small"
                                                color={getPriorityColor(rec.priority)}
                                                variant={rec.priority === 'critical' ? 'filled' : 'outlined'}
                                                sx={{ fontWeight: 700, textTransform: 'uppercase' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{rec.status}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            {rec.status === 'pending' ? (
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                    <IconButton size="small" color="success" onClick={() => handleStatusUpdate(rec._id, 'approved', rec.optimalReorderQty)} title="Approve">
                                                        <FaCheck />
                                                    </IconButton>
                                                    <IconButton size="small" color="primary" onClick={() => openEditModal(rec)} title="Adjust">
                                                        <FaEdit />
                                                    </IconButton>
                                                    <IconButton size="small" color="error" onClick={() => handleStatusUpdate(rec._id, 'rejected')} title="Reject">
                                                        <FaTrash />
                                                    </IconButton>
                                                </Box>
                                            ) : (
                                                <IconButton size="small" onClick={() => handleDelete(rec._id)}><FaTrash /></IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={recommendations.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    />
                </TableContainer>
            </Box>

            {/* Manual Entry / Edit Modal */}
            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {modalType === 'add' ? 'Add Manual Recommendation' : 'Adjust AI Recommendation'}
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Grid container spacing={3} sx={{ mt: 0.5 }}>
                        {modalType === 'add' && (
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Select Medicine</InputLabel>
                                    <Select
                                        value={formData.medicineId}
                                        label="Select Medicine"
                                        onChange={(e) => setFormData({ ...formData, medicineId: e.target.value })}
                                    >
                                        {medicines.map(m => <MenuItem key={m._id} value={m._id}>{m.name} (Stock: {m.quantity})</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Reorder Quantity"
                                type="number"
                                value={formData.optimalReorderQty}
                                onChange={(e) => setFormData({ ...formData, optimalReorderQty: parseInt(e.target.value) })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    value={formData.priority}
                                    label="Priority"
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <MenuItem value="low">Low</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="high">High</MenuItem>
                                    <MenuItem value="critical">Critical</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Restocking Date"
                                type="date"
                                value={formData.restockingDate}
                                onChange={(e) => setFormData({ ...formData, restockingDate: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleModalSubmit}>
                        {modalType === 'add' ? 'Create' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
}
