/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, Button } from '@mui/material';
import { PickersLayoutContentWrapper, PickersLayoutProps, PickersLayoutRoot, usePickerLayout } from '@mui/x-date-pickers/PickersLayout';
import { DateView } from '@mui/x-date-pickers/models/views';

const CustomDialog = (props: any) => {
    const { handleCancel } = props;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 0,
            gap: '20px',
            padding: '1rem',
            fontWeight: 'bold',
        }}>
            <Button onClick={handleCancel}>Отмена</Button>
        </div>
    );
}

function CustomLayout(props: PickersLayoutProps<Dayjs | null, Dayjs, DateView>) {
    const { content, actionBar } = usePickerLayout(props);
    return (
        <PickersLayoutRoot ownerState={props}>
            <PickersLayoutContentWrapper sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
                boxShadow: 'none',
                height: '90%',
                width: '100%'
            }}>
                {content}
                {actionBar}
            </PickersLayoutContentWrapper>
        </PickersLayoutRoot>
    );
}

interface CustomDatePickerProps {
    value?: Dayjs;
    onChange?: (date: Dayjs) => void;
}

const CustomDatePicker = ({
    value = dayjs(), onChange = () => { }
}: CustomDatePickerProps) => {
    const theme = createTheme({
        components: {
            MuiTextField: {
                styleOverrides: {
                    root: {
                        input: {
                            color: 'white',
                            cursor: 'pointer'
                        },
                        label: {
                            color: 'white',
                        },
                    },
                },
            },
        },
        palette: {
            mode: 'dark',
        },
    });

    const [startDate, setStartDate] = useState(value);
    const [open, setOpen] = useState(false);

    const handleStartDateChange = (newValue: Dayjs | null) => {
        if (newValue) {
            onChange(newValue);
            setStartDate(newValue);
            setOpen(false);
        }
    };

    const handleCancel = () => {
        setStartDate(value);
        setOpen(false);
    }

    useEffect(() => {
        if (open) {
            setStartDate(value);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    const today = dayjs();
    const minDate = today.subtract(14, 'day');
    const maxDate = today;

    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
                <Box display="flex" justifyContent="center" alignItems="center">
                    <DatePicker
                        sx={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.3)', cursor: 'pointer' }}
                        label="Select Date"
                        minDate={minDate}
                        maxDate={maxDate}
                        views={['day']}
                        showDaysOutsideCurrentMonth
                        view='day'
                        open={open}
                        closeOnSelect
                        value={startDate}
                        onClose={() => setOpen(false)} // Close the dialog when clicking outside
                        slots={{
                            layout: CustomLayout,
                            actionBar: () => <CustomDialog open={open} handleCancel={handleCancel} />,
                        }}
                        slotProps={{
                            textField: {
                                InputProps: {
                                    value: startDate.format('DD/MM/YYYY'),
                                    endAdornment: null,
                                    onClick: () => {
                                        setOpen((prev) => !prev);
                                    },
                                    sx: {
                                        cursor: 'pointer'
                                    }
                                },
                            },
                            popper: {
                                sx: {
                                    height: '300px',
                                }
                            }
                        }}
                        format="DD/MM/YYYY"
                        onChange={handleStartDateChange}
                    />
                </Box>
            </LocalizationProvider>
        </ThemeProvider>
    );
}

CustomDatePicker.displayName = 'CustomDatePicker';
export default CustomDatePicker;
