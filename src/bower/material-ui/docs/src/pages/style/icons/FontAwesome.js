import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { loadCSS } from 'fg-loadcss/src/loadCSS';
import { withStyles } from 'src/bower/material-ui/packages/material-ui/src/styles';
import red from 'src/bower/material-ui/packages/material-ui/src/colors/red';
import Icon from 'src/bower/material-ui/packages/material-ui/src/Icon';

const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  icon: {
    margin: theme.spacing.unit * 2,
  },
  iconHover: {
    margin: theme.spacing.unit * 2,
    '&:hover': {
      color: red[800],
    },
  },
});

class FontAwesome extends React.Component {
  componentDidMount() {
    loadCSS(
      'https://use.fontawesome.com/releases/v5.1.0/css/all.css',
      document.querySelector('#insertion-point-jss'),
    );
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Icon className={classNames(classes.icon, 'fa fa-plus-circle')} />
        <Icon className={classNames(classes.icon, 'fa fa-plus-circle')} color="primary" />
        <Icon className={classNames(classes.icon, 'fa fa-plus-circle')} color="secondary" />
        <Icon className={classNames(classes.icon, 'fa fa-plus-circle')} color="action" />
        <Icon
          className={classNames(classes.iconHover, 'fa fa-plus-circle')}
          color="error"
          style={{ fontSize: 30 }}
        />
        <Icon
          className={classNames(classes.icon, 'fa fa-plus-circle')}
          color="disabled"
          fontSize="large"
        />
      </div>
    );
  }
}

FontAwesome.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FontAwesome);
