const selectStyles = {
  control: styles => ({
    ...styles,
    borderRadius: 1,
    height: 42,
    display: 'flex',
    alignItems: 'center'
  }),
  input: styles => ({ ...styles, height: 40, fontSize: 16, padding: 0 }),
  valueContainer: styles => ({
    ...styles,
    height: 40,
    padding: 0,
    paddingLeft: 20,
    paddingRight: 20
  }),
  indicatorsContainer: styles => ({ ...styles, height: 40 }),
  singleValue: styles => ({
    position: 'static'
  }),
  placholder: styles => ({
    position: 'static'
  })
};

export default selectStyles;
