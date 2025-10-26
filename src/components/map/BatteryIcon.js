import { useTheme } from '@mui/material';
import { Battery20, Battery50, Battery80, BatteryFull } from '@mui/icons-material';

const BatteryIcon = ({ level }) => {
  const theme = useTheme();
  const getBatteryIcon = () => {
    if (level >= 80) return <BatteryFull sx={{ color: theme.palette.success.main }} />;
    if (level >= 60) return <Battery80 sx={{ color: theme.palette.success.light }} />;
    if (level >= 40) return <Battery50 sx={{ color: theme.palette.warning.main }} />;
    return <Battery20 sx={{ color: theme.palette.error.main }} />;
  };

  return getBatteryIcon();
};

export default BatteryIcon;