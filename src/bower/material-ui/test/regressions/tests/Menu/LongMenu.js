import React from 'react';
import IconButton from 'src/bower/material-ui/packages/material-ui/src/IconButton';
import PropTypes from 'prop-types';
import { withStyles } from 'src/bower/material-ui/packages/material-ui/src/styles';
import Menu from 'src/bower/material-ui/packages/material-ui/src/Menu';
import MenuItem from 'src/bower/material-ui/packages/material-ui/src/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';

const styles = {
  root: {
    margin: '200px 0 200px',
    background: 'papayawhip',
    padding: '0 100px',
  },
};

const options = [
  'None',
  'Atria',
  'Callisto',
  'Dione',
  'Ganymede',
  'Hangouts Call',
  'Luna',
  'Oberon',
  'Phobos',
  'Pyxis',
  'Sedna',
  'Titania',
  'Triton',
  'Umbriel',
];

const ITEM_HEIGHT = 48;

class LongMenu extends React.Component {
  state = {
    anchorEl: null,
  };

  componentDidMount() {
    this.setState({ anchorEl: this.buttonRef });
  }

  render() {
    const { classes } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <div className={classes.root}>
        <IconButton
          buttonRef={ref => {
            this.buttonRef = ref;
          }}
          aria-label="More"
          aria-owns={open ? 'long-menu' : undefined}
          aria-haspopup="true"
          onClick={this.handleClick}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="long-menu"
          anchorEl={anchorEl}
          open={open}
          PaperProps={{
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
              width: 200,
            },
          }}
        >
          {options.map(option => (
            <MenuItem key={option} selected={option === 'Pyxis'}>
              {option}
            </MenuItem>
          ))}
        </Menu>
      </div>
    );
  }
}

LongMenu.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LongMenu);
