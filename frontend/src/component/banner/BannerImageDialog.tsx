import React from 'react';
import { Dialog, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSelector } from 'react-redux';
import { RootStore, useAppDispatch } from '@/store/store';
import { closeDialog } from '@/store/dialogSlice';

const BannerImageDialog = () => {
    const { dialogue, dialogueData, dialogueType } = useSelector((state: RootStore) => state.dialogue);
    const dispatch = useAppDispatch();

    if (dialogueType !== "bannerImage") return null;

    return (
        <Dialog 
            open={dialogue} 
            onClose={() => dispatch(closeDialog())}
            maxWidth="lg"
            PaperProps={{
                style: {
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'visible'
                }
            }}
        >
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <IconButton
                    onClick={() => dispatch(closeDialog())}
                    sx={{
                        position: "absolute",
                        top: -20,
                        right: -20,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        color: "white",
                        zIndex: 10,
                        "&:hover": {
                            backgroundColor: "rgba(0,0,0,0.9)",
                        }
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <img 
                    src={dialogueData} 
                    alt="Banner Expanded" 
                    onError={(e) => {
                        e.currentTarget.src = "/images/noImage.png";
                    }}
                    style={{ 
                        width: '50vw', 
                        height: '50vh', 
                        borderRadius: '12px',
                        objectFit: 'cover',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                    }} 
                />
            </div>
        </Dialog>
    );
};

export default BannerImageDialog;
